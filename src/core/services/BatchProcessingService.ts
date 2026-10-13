import {
  ProcesadorLotes,
  OpcionesProcesamientoLote,
  EventoProgresoLote,
  FragmentoResultado
} from '../domain/interfaces/ProcesadorLotes';
import { FragmentoTexto, SegmentadorChunking } from '../domain/interfaces/SegmentadorChunking';
import { ResultadoAnalisis } from '../domain/entities/ResultadoAnalisis';
import { ClasificacionIA } from '../domain/enums/ClasificacionIA';
import { ErrorProcesoCancelado, ErrorTextoVacio } from '../domain/errors/ErroresDominio';
import { DetectorService } from './DetectorService';
import { ChunkingService } from './ChunkingService';
import { MetricasAggregator } from './MetricasAggregator';

/**
 * Orquestador asíncrono para el procesamiento por lotes y fragmentos de textos extensos.
 * Despacha secuencialmente fragmentos a DetectorService sin congelar el hilo principal,
 * emitiendo eventos de progreso en tiempo real y permitiendo cancelación limpia.
 */
export class BatchProcessingService implements ProcesadorLotes {
  private detector: DetectorService;
  private chunking: SegmentadorChunking;
  private aggregator: MetricasAggregator;
  private abortControllerInterno: AbortController | null = null;

  constructor(
    detector?: DetectorService,
    chunking?: SegmentadorChunking,
    aggregator?: MetricasAggregator
  ) {
    this.detector = detector || new DetectorService();
    this.chunking = chunking || new ChunkingService();
    this.aggregator = aggregator || new MetricasAggregator();
  }

  /**
   * Cancela cualquier proceso en ejecución gestionado internamente por el servicio.
   */
  public cancelar(): void {
    if (this.abortControllerInterno) {
      this.abortControllerInterno.abort();
      this.abortControllerInterno = null;
    }
  }

  /**
   * Procesa un documento completo dividiéndolo en fragmentos si excede el umbral seguro.
   */
  public async procesarDocumento(
    texto: string,
    opciones?: OpcionesProcesamientoLote
  ): Promise<ResultadoAnalisis> {
    if (!texto || texto.trim().length === 0) {
      throw new ErrorTextoVacio();
    }

    // Configurar control de cancelación unificado
    this.abortControllerInterno = new AbortController();
    const signalInterno = this.abortControllerInterno.signal;

    const estaCancelado = (): boolean => {
      return Boolean(opciones?.signal?.aborted || signalInterno.aborted);
    };

    if (estaCancelado()) {
      throw new ErrorProcesoCancelado('El análisis fue cancelado antes de iniciar.');
    }

    const umbral = opciones?.umbralDirectoCaracteres ?? 15000;
    const tiempoInicio = performance.now();

    // 1. Caso de texto corto/moderado: procesar directamente en un solo bloque
    if (texto.length <= umbral) {
      this.notificarProgreso(opciones?.onProgreso, {
        progreso: 0,
        fragmentoActual: 1,
        totalFragmentos: 1,
        tiempoEstimadoSegundos: 1,
        tiempoTranscurridoMs: 0,
        estado: 'iniciando',
        mensaje: 'Analizando documento...'
      });

      if (estaCancelado()) {
        throw new ErrorProcesoCancelado('El análisis fue cancelado.');
      }

      const resultado = await this.detector.analizar(texto, {
        sensibilidad: opciones?.sensibilidad
      });

      if (estaCancelado()) {
        throw new ErrorProcesoCancelado('El análisis fue cancelado.');
      }

      this.notificarProgreso(opciones?.onProgreso, {
        progreso: 100,
        fragmentoActual: 1,
        totalFragmentos: 1,
        tiempoEstimadoSegundos: 0,
        tiempoTranscurridoMs: Math.round(performance.now() - tiempoInicio),
        estado: 'completado',
        resultadoAcumulado: resultado,
        resultadoParcialFragmento: resultado,
        mensaje: 'Análisis completado exitosamente.'
      });

      return resultado;
    }

    // 2. Segmentación semántica de textos extensos
    const fragmentos = this.chunking.dividirEnFragmentos(texto, {
      tamanoObjetivoCaracteres: 12000,
      tamanoMaximoCaracteres: 15000,
      tamanoMinimoCaracteres: 2500
    });

    const totalFragmentos = fragmentos.length;

    // Notificación inicial
    this.notificarProgreso(opciones?.onProgreso, {
      progreso: 0,
      fragmentoActual: 0,
      totalFragmentos,
      tiempoEstimadoSegundos: Math.max(1, Math.ceil(totalFragmentos * 0.4)),
      tiempoTranscurridoMs: 0,
      estado: 'iniciando',
      mensaje: `Iniciando análisis segmentado (${totalFragmentos} bloques)...`
    });

    const fragmentosResultados: FragmentoResultado[] = [];

    // 3. Ejecución secuencial por fragmento en cola
    for (let i = 0; i < totalFragmentos; i++) {
      if (estaCancelado()) {
        this.notificarProgreso(opciones?.onProgreso, {
          progreso: Math.round((i / totalFragmentos) * 100),
          fragmentoActual: i,
          totalFragmentos,
          tiempoEstimadoSegundos: 0,
          tiempoTranscurridoMs: Math.round(performance.now() - tiempoInicio),
          estado: 'cancelado',
          mensaje: 'Análisis cancelado por el usuario.'
        });
        throw new ErrorProcesoCancelado('El análisis del documento fue abortado por el usuario.');
      }

      const fragmentoActual = fragmentos[i];

      // Ceder el hilo principal (micro-delay) para permitir que la interfaz actualice el render
      await new Promise((resolve) => setTimeout(resolve, 20));

      if (estaCancelado()) {
        throw new ErrorProcesoCancelado('El análisis del documento fue abortado por el usuario.');
      }

      // Procesar fragmento individual con reintento y tolerancia a fallos
      const { resultado, advertencia } = await this.procesarFragmentoSeguro(
        fragmentoActual,
        opciones?.sensibilidad
      );

      fragmentosResultados.push({
        fragmento: fragmentoActual,
        resultado,
        advertencia
      });

      // Calcular estimaciones de tiempo en base al histórico de ejecución
      const tiempoTranscurridoMs = Math.round(performance.now() - tiempoInicio);
      const tiempoPromedioPorBloque = tiempoTranscurridoMs / (i + 1);
      const bloquesRestantes = totalFragmentos - (i + 1);
      const tiempoEstimadoSegundos = Math.max(
        0,
        Math.round((bloquesRestantes * tiempoPromedioPorBloque) / 1000)
      );

      const porcentaje = Math.round(((i + 1) / totalFragmentos) * 100);

      // Consolidar estado acumulado hasta el momento para renderizado progresivo
      const textoAcumulado = texto.slice(0, fragmentoActual.fin);
      const acumuladoParcial = this.aggregator.consolidar(
        fragmentosResultados,
        textoAcumulado
      );

      const esUltimo = i + 1 === totalFragmentos;

      this.notificarProgreso(opciones?.onProgreso, {
        progreso: porcentaje,
        fragmentoActual: i + 1,
        totalFragmentos,
        tiempoEstimadoSegundos,
        tiempoTranscurridoMs,
        estado: esUltimo ? 'completado' : 'procesando',
        fragmento: fragmentoActual,
        resultadoParcialFragmento: resultado,
        resultadoAcumulado: acumuladoParcial,
        mensaje: esUltimo
          ? 'Consolidando métricas globales...'
          : `Analizando bloque ${i + 1} de ${totalFragmentos}...`
      });
    }

    if (estaCancelado()) {
      throw new ErrorProcesoCancelado('El análisis fue cancelado.');
    }

    // 4. Consolidación final completa
    const resultadoFinal = this.aggregator.consolidar(fragmentosResultados, texto);
    return resultadoFinal;
  }

  /**
   * Procesa un fragmento individual con tolerancia a fallos y reintento automático.
   */
  private async procesarFragmentoSeguro(
    fragmento: FragmentoTexto,
    sensibilidad?: number
  ): Promise<{ resultado: ResultadoAnalisis; advertencia?: string }> {
    try {
      const resultado = await this.detector.analizar(fragmento.texto, { sensibilidad });
      return { resultado };
    } catch (primerError) {
      // Reintento tras breve pausa
      await new Promise((resolve) => setTimeout(resolve, 50));
      try {
        const resultado = await this.detector.analizar(fragmento.texto, { sensibilidad });
        return { resultado };
      } catch (segundoError: any) {
        // En caso de falla persistente en un bloque específico, no abortar el documento completo
        const advertencia = `Bloque ${fragmento.indice + 1} procesado con advertencia: ${
          segundoError?.message || 'Error granular'
        }`;
        const fallback = this.crearResultadoFallback(fragmento, advertencia);
        return { resultado: fallback, advertencia };
      }
    }
  }

  /**
   * Crea un resultado de análisis neutral para garantizar que bloques con errores
   * no invaliden el procesamiento global.
   */
  private crearResultadoFallback(fragmento: FragmentoTexto, advertencia: string): ResultadoAnalisis {
    return {
      textoOriginal: fragmento.texto,
      probabilidadGlobalIA: 50,
      clasificacionGlobal: ClasificacionIA.MIXTO_DUDOSO,
      etiquetaClasificacion: 'Mixto / Dudoso',
      metricas: {
        perplejidad: 50,
        perplejidadCruda: 50,
        burstiness: 50,
        coeficienteVariacion: 0.35,
        diversidadLexica: 50,
        densidadCliches: 0,
        clichesDetectados: [],
        totalOraciones: 1,
        totalPalabras: fragmento.totalPalabras,
        promedioPalabrasPorOracion: fragmento.totalPalabras
      },
      oraciones: [
        {
          indice: 0,
          texto: fragmento.texto,
          inicio: 0,
          fin: fragmento.texto.length,
          conteoPalabras: fragmento.totalPalabras,
          perplejidadLocal: 50,
          probabilidadIA: 50,
          clasificacion: ClasificacionIA.MIXTO_DUDOSO,
          marcasDetectadas: [],
          diagnostico: advertencia
        }
      ],
      parrafos: [
        {
          indice: 0,
          texto: fragmento.texto,
          inicio: 0,
          fin: fragmento.texto.length,
          probabilidadIA: 50,
          clasificacion: ClasificacionIA.MIXTO_DUDOSO,
          oraciones: []
        }
      ],
      diagnosticoResumen: advertencia,
      tiempoProcesamientoMs: 1,
      timestamp: new Date().toISOString()
    };
  }

  private notificarProgreso(
    callback?: (evento: EventoProgresoLote) => void,
    evento?: EventoProgresoLote
  ): void {
    if (callback && evento) {
      try {
        callback(evento);
      } catch (err) {
        console.warn('Error en callback de progreso de lote:', err);
      }
    }
  }
}
