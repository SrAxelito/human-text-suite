import { describe, it, expect } from 'vitest';
import { VisorTexto } from '../../src/presentation/components/VisorTexto';
import { ResultadoAnalisis, ClasificacionIA, MetricasDeteccion, OracionAnalizada } from '../../src/core/domain';

describe('VisorTexto - Renderizado y Mapeo de Marcadores Laterales y Subrayado Sutil', () => {
  const metricasDummy: MetricasDeteccion = {
    perplejidad: 45,
    perplejidadCruda: 45,
    burstiness: 60,
    coeficienteVariacion: 0.55,
    diversidadLexica: 70,
    densidadCliches: 10,
    clichesDetectados: [],
    totalOraciones: 2,
    totalPalabras: 20,
    promedioPalabrasPorOracion: 10
  };

  const oracionesMock: OracionAnalizada[] = [
    {
      indice: 0,
      texto: 'Esta primera oración es un texto de prueba redactado por un humano.',
      inicio: 0,
      fin: 68,
      conteoPalabras: 12,
      perplejidadLocal: 72,
      probabilidadIA: 18,
      clasificacion: ClasificacionIA.PROBABLEMENTE_HUMANO,
      marcasDetectadas: [],
      diagnostico: 'Flujo y cadencia orgánica natural.'
    },
    {
      indice: 1,
      texto: 'En resumen, este segundo fragmento artificial juega un papel crucial.',
      inicio: 70,
      fin: 139,
      conteoPalabras: 10,
      perplejidadLocal: 15,
      probabilidadIA: 88,
      clasificacion: ClasificacionIA.ALTAMENTE_PROBABLE_IA,
      marcasDetectadas: ['Conector cliché: "en resumen"'],
      diagnostico: 'Presencia de fórmulas sintéticas.'
    }
  ];

  const analisisMock: ResultadoAnalisis = {
    textoOriginal: `${oracionesMock[0].texto} ${oracionesMock[1].texto}`,
    probabilidadGlobalIA: 53,
    clasificacionGlobal: ClasificacionIA.MIXTO_DUDOSO,
    etiquetaClasificacion: 'Mixto / Dudoso',
    metricas: metricasDummy,
    oraciones: oracionesMock,
    parrafos: [
      {
        indice: 0,
        texto: `${oracionesMock[0].texto} ${oracionesMock[1].texto}`,
        inicio: 0,
        fin: 139,
        probabilidadIA: 88,
        clasificacion: ClasificacionIA.ALTAMENTE_PROBABLE_IA,
        oraciones: oracionesMock
      }
    ],
    diagnosticoResumen: 'Texto híbrido.',
    tiempoProcesamientoMs: 12,
    timestamp: new Date().toISOString()
  };

  it('debe mapear cada oración a su clase de subrayado sutil y atributo data-sentence-id correspondiente', () => {
    const html = VisorTexto.render(analisisMock, null);

    // Primera oración (humana)
    expect(html).toContain('sentence-subtle-human');
    expect(html).toContain('data-sentence-id="0"');
    expect(html).toContain(oracionesMock[0].texto);

    // Segunda oración (IA)
    expect(html).toContain('sentence-subtle-ai');
    expect(html).toContain('data-sentence-id="1"');
    expect(html).toContain(oracionesMock[1].texto);
  });

  it('debe renderizar el marcador en el margen (gutter) con la categoría más alta del bloque', () => {
    const html = VisorTexto.render(analisisMock, null);

    // El párrafo contiene una oración con 88% IA, el gutter debe ser gutter-ai
    expect(html).toContain('gutter-marker gutter-ai');
    expect(html).toContain('gutter-columna');
  });

  it('debe renderizar la tarjeta de inspección contextual con métricas exactas y diagnóstico', () => {
    const htmlTarjeta = VisorTexto.renderTarjetaInspeccion(oracionesMock[1]);

    expect(htmlTarjeta).toContain('88% IA');
    expect(htmlTarjeta).toContain('Oración #2');
    expect(htmlTarjeta).toContain('Altamente probable de IA');
    expect(htmlTarjeta).toContain('10 palabras');
    expect(htmlTarjeta).toContain('15/100');
    expect(htmlTarjeta).toContain('Presencia de fórmulas sintéticas.');
    expect(htmlTarjeta).toContain('Conector cliché: &quot;en resumen&quot;');
  });

  it('debe renderizar estado vacío cuando no hay oraciones analizadas', () => {
    const htmlVacio = VisorTexto.render(null, null);
    expect(htmlVacio).toContain('visor-vacio');
    expect(htmlVacio).toContain('No hay oraciones analizadas aún');
  });
});
