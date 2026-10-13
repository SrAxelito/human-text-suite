import { describe, it, expect, vi } from 'vitest';
import { BatchProcessingService } from '../../src/core/services/BatchProcessingService';
import { ChunkingService } from '../../src/core/services/ChunkingService';
import { MetricasAggregator } from '../../src/core/services/MetricasAggregator';
import { DetectorService } from '../../src/core/services/DetectorService';
import { EventoProgresoLote } from '../../src/core/domain/interfaces/ProcesadorLotes';
import { ErrorProcesoCancelado } from '../../src/core/domain/errors/ErroresDominio';

describe('Pruebas de Integración - Procesamiento por Lotes y Segmentación de Documentos Extensos', () => {
  it('debe procesar un documento sintético de más de 100.000 caracteres emitiendo eventos de progreso hasta el 100%', async () => {
    const batchService = new BatchProcessingService();

    // Generar muestra sintética estructurada de más de 100.000 caracteres
    const parrafoSintetico =
      'En conclusión, la adopción de tecnologías de inteligencia artificial representa una evolución indispensable en la sociedad contemporánea. ' +
      'Resulta fundamental destacar que la automatización de procesos complejos ofrece ventajas operativas indiscutibles para las organizaciones. ' +
      'No obstante, el pensamiento crítico humano y la creatividad subjetiva siguen siendo irremplazables ante cualquier desafío hermenéutico o ético.\n\n';

    // 270 repeticiones ≈ 104.000 caracteres
    const texto100k = parrafoSintetico.repeat(270);
    expect(texto100k.length).toBeGreaterThan(100000);

    const eventosProgreso: EventoProgresoLote[] = [];

    const resultado = await batchService.procesarDocumento(texto100k, {
      onProgreso: (e) => eventosProgreso.push({ ...e })
    });

    // 1. Integridad del texto y dimensiones
    expect(resultado).toBeDefined();
    expect(resultado.textoOriginal.length).toBe(texto100k.length);
    expect(resultado.textoOriginal).toBe(texto100k);

    // 2. Fragmentación correcta en bloques seguros (10k a 15k caracteres)
    expect(eventosProgreso.length).toBeGreaterThanOrEqual(8);
    const totalBloques = eventosProgreso[0].totalFragmentos;
    expect(totalBloques).toBeGreaterThanOrEqual(7);
    expect(totalBloques).toBeLessThanOrEqual(11);

    // 3. Emisión de eventos de progreso de 0 a 100%
    const primerEvento = eventosProgreso[0];
    expect(primerEvento.progreso).toBe(0);
    expect(primerEvento.estado).toBe('iniciando');

    const ultimoEvento = eventosProgreso[eventosProgreso.length - 1];
    expect(ultimoEvento.progreso).toBe(100);
    expect(ultimoEvento.estado).toBe('completado');

    // Comprobar avance monótono
    for (let i = 1; i < eventosProgreso.length; i++) {
      expect(eventosProgreso[i].progreso).toBeGreaterThanOrEqual(eventosProgreso[i - 1].progreso);
    }

    // 4. Verificación de reconstrucción y exactitud de offsets de oraciones al 100%
    expect(resultado.oraciones.length).toBeGreaterThan(700);
    for (let idx = 0; idx < Math.min(resultado.oraciones.length, 50); idx++) {
      const oracion = resultado.oraciones[idx];
      const sliceOriginal = texto100k.slice(oracion.inicio, oracion.fin);
      expect(sliceOriginal).toBe(oracion.texto);
    }

    // Comprobar también el último bloque de oraciones
    const ultimasOraciones = resultado.oraciones.slice(-20);
    for (const oracion of ultimasOraciones) {
      const sliceOriginal = texto100k.slice(oracion.inicio, oracion.fin);
      expect(sliceOriginal).toBe(oracion.texto);
    }

    // 5. Verificación de párrafos consolidados
    expect(resultado.parrafos.length).toBeGreaterThanOrEqual(250);
    for (let pIdx = 0; pIdx < Math.min(resultado.parrafos.length, 20); pIdx++) {
      const parrafo = resultado.parrafos[pIdx];
      const sliceParrafo = texto100k.slice(parrafo.inicio, parrafo.fin);
      expect(sliceParrafo).toBe(parrafo.texto);
    }

    // 6. Métricas globales consolidadas coherentes
    expect(resultado.metricas.totalPalabras).toBeGreaterThan(12000);
    expect(resultado.metricas.totalOraciones).toBe(resultado.oraciones.length);
    expect(resultado.probabilidadGlobalIA).toBeGreaterThan(0);
    expect(resultado.probabilidadGlobalIA).toBeLessThan(100);
  }, 35000);

  it('debe abortar limpiamente el análisis en curso cuando el usuario cancela, deteniendo peticiones y liberando recursos', async () => {
    const batchService = new BatchProcessingService();
    const abortController = new AbortController();

    const parrafo = 'Párrafo de prueba para cancelación de flujo asíncrono con múltiples oraciones y datos. '.repeat(10) + '\n\n';
    const textoExtenso = parrafo.repeat(150); // ~130.000 caracteres

    const eventosCapturados: EventoProgresoLote[] = [];
    let cancelacionDisparada = false;

    const promesaAnalisis = batchService.procesarDocumento(textoExtenso, {
      signal: abortController.signal,
      onProgreso: (evento) => {
        eventosCapturados.push(evento);
        // Abortar en el segundo fragmento
        if (evento.fragmentoActual >= 2 && !cancelacionDisparada) {
          cancelacionDisparada = true;
          abortController.abort();
        }
      }
    });

    await expect(promesaAnalisis).rejects.toThrow(ErrorProcesoCancelado);

    // Validar que se detuvo antes de completar todos los fragmentos
    const totalEsperado = eventosCapturados[0]?.totalFragmentos || 10;
    const ultimoProcesado = eventosCapturados[eventosCapturados.length - 1]?.fragmentoActual || 0;
    expect(ultimoProcesado).toBeLessThan(totalEsperado);
  });

  it('debe tolerar fallos en fragmentos individuales reintentando o aplicando advertencia sin abortar el documento completo', async () => {
    const chunking = new ChunkingService();
    const aggregator = new MetricasAggregator();

    let llamadas = 0;
    const detectorMock = {
      analizar: vi.fn().mockImplementation(async (texto: string) => {
        llamadas++;
        // Provocar fallo simulado en el segundo bloque
        if (llamadas === 2) {
          throw new Error('Timeout simulado en micro-servicio');
        }
        const realDetector = new DetectorService();
        return realDetector.analizar(texto);
      })
    } as unknown as DetectorService;

    const batchService = new BatchProcessingService(detectorMock, chunking, aggregator);

    const textoMedio = ('Párrafo uno que contiene contenido variado para la prueba de tolerancia. '.repeat(10) + '\n\n').repeat(80);

    const resultado = await batchService.procesarDocumento(textoMedio, {
      umbralDirectoCaracteres: 5000
    });

    expect(resultado).toBeDefined();
    expect(resultado.oraciones.length).toBeGreaterThan(0);
  });
});
