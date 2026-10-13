import {
  ResultadoAnalisis,
  OracionAnalizada,
  ParrafoAnalizado,
  MetricasDeteccion,
  ClasificacionIA,
  clasificarProbabilidad,
  obtenerEtiquetaClasificacion
} from '../domain';
import { FragmentoResultado } from '../domain/interfaces/ProcesadorLotes';
import { BurstinessCalculator } from '../infrastructure/nlp/BurstinessCalculator';
import { Tokenizer } from '../infrastructure/nlp/Tokenizer';

/**
 * Servicio encargado de consolidar y ponderar métricas de múltiples fragmentos
 * de texto en un resultado global coherente y unificado.
 */
export class MetricasAggregator {
  private burstinessCalc: BurstinessCalculator;

  constructor(burstinessCalc?: BurstinessCalculator) {
    this.burstinessCalc = burstinessCalc || new BurstinessCalculator();
  }

  /**
   * Consolida un conjunto de fragmentos analizados en un único ResultadoAnalisis global.
   *
   * @param fragmentosResultados Lista ordenada de fragmentos con sus resultados individuales.
   * @param textoCompleto Texto original consolidado (opcional; si se omite, se ensambla de los fragmentos).
   */
  public consolidar(
    fragmentosResultados: FragmentoResultado[],
    textoCompleto?: string
  ): ResultadoAnalisis {
    if (fragmentosResultados.length === 0) {
      throw new Error('No se proporcionaron fragmentos para consolidar métricas.');
    }

    const textoDocumento =
      textoCompleto ?? fragmentosResultados.map((item) => item.fragmento.texto).join('');

    // 1. Agregación y mapeo global de oraciones con offsets recalculados
    let indiceOracionGlobal = 0;
    const oracionesGlobales: OracionAnalizada[] = [];

    for (const item of fragmentosResultados) {
      const offsetChunk = item.fragmento.inicio;
      for (const oracion of item.resultado.oraciones) {
        oracionesGlobales.push({
          ...oracion,
          indice: indiceOracionGlobal++,
          inicio: offsetChunk + oracion.inicio,
          fin: offsetChunk + oracion.fin
        });
      }
    }

    // 2. Agregación y mapeo global de párrafos con offsets recalculados
    let indiceParrafoGlobal = 0;
    const parrafosGlobales: ParrafoAnalizado[] = [];

    for (const item of fragmentosResultados) {
      const offsetChunk = item.fragmento.inicio;
      for (const parrafo of item.resultado.parrafos) {
        const inicioGlobal = offsetChunk + parrafo.inicio;
        const finGlobal = offsetChunk + parrafo.fin;

        // Asociar las oraciones globales que caen dentro de este párrafo
        const oracionesDelParrafo = oracionesGlobales.filter(
          (o) => o.inicio >= inicioGlobal && o.fin <= finGlobal
        );

        parrafosGlobales.push({
          indice: indiceParrafoGlobal++,
          texto: parrafo.texto,
          inicio: inicioGlobal,
          fin: finGlobal,
          probabilidadIA: parrafo.probabilidadIA,
          clasificacion: parrafo.clasificacion,
          oraciones: oracionesDelParrafo.length > 0 ? oracionesDelParrafo : parrafo.oraciones
        });
      }
    }

    // 3. Totales de palabras y caracteres
    const totalPalabras = fragmentosResultados.reduce(
      (acc, item) => acc + item.resultado.metricas.totalPalabras,
      0
    );
    const totalCaracteres = textoDocumento.length;
    const totalOraciones = oracionesGlobales.length;

    // 4. Cálculo ponderado de la probabilidad global de IA
    let probabilidadGlobalIA: number;
    if (totalPalabras > 0) {
      const sumaPonderada = fragmentosResultados.reduce((acc, item) => {
        return acc + item.resultado.probabilidadGlobalIA * item.resultado.metricas.totalPalabras;
      }, 0);
      probabilidadGlobalIA = Math.round(sumaPonderada / totalPalabras);
    } else if (totalCaracteres > 0) {
      const sumaPonderada = fragmentosResultados.reduce((acc, item) => {
        return acc + item.resultado.probabilidadGlobalIA * item.fragmento.totalCaracteres;
      }, 0);
      probabilidadGlobalIA = Math.round(sumaPonderada / totalCaracteres);
    } else {
      const sumaSimple = fragmentosResultados.reduce(
        (acc, item) => acc + item.resultado.probabilidadGlobalIA,
        0
      );
      probabilidadGlobalIA = Math.round(sumaSimple / fragmentosResultados.length);
    }

    probabilidadGlobalIA = Math.min(99, Math.max(1, probabilidadGlobalIA));
    const clasificacionGlobal = clasificarProbabilidad(probabilidadGlobalIA);
    const etiquetaClasificacion = obtenerEtiquetaClasificacion(clasificacionGlobal);

    // 5. Perplejidad media ponderada
    let perplejidadPonderada = 50;
    let perplejidadCrudaPonderada = 50;

    if (totalPalabras > 0) {
      const sumaPpl = fragmentosResultados.reduce(
        (acc, item) => acc + item.resultado.metricas.perplejidad * item.resultado.metricas.totalPalabras,
        0
      );
      const sumaPplCruda = fragmentosResultados.reduce(
        (acc, item) => acc + item.resultado.metricas.perplejidadCruda * item.resultado.metricas.totalPalabras,
        0
      );
      perplejidadPonderada = Math.round((sumaPpl / totalPalabras) * 100) / 100;
      perplejidadCrudaPonderada = Math.round((sumaPplCruda / totalPalabras) * 100) / 100;
    }

    // 6. Burstiness y variabilidad calculada sobre el total del documento
    const textosOraciones = oracionesGlobales.map((o) => o.texto);
    const cadenciaGlobal = this.burstinessCalc.calcularCadencia(textosOraciones);

    // 7. Diversidad léxica global (Type-Token Ratio sobre todo el texto)
    const todasLasPalabras = Tokenizer.tokenizarPalabras(textoDocumento);
    const diversidadGlobal = Tokenizer.calcularDiversidadLexica(todasLasPalabras);

    // 8. Unificación y remapeo de clichés detectados
    const clichesGlobales: Array<{
      marcador: string;
      categoria: 'conector_academico' | 'muletilla_llm' | 'estructura_formulaica';
      posicion: number;
    }> = [];

    const registroPosiciones = new Set<string>();

    for (const item of fragmentosResultados) {
      const offsetChunk = item.fragmento.inicio;
      for (const cliche of item.resultado.metricas.clichesDetectados) {
        const posGlobal = offsetChunk + cliche.posicion;
        const clave = `${cliche.marcador}_${posGlobal}`;
        if (!registroPosiciones.has(clave)) {
          registroPosiciones.add(clave);
          clichesGlobales.push({
            marcador: cliche.marcador,
            categoria: cliche.categoria,
            posicion: posGlobal
          });
        }
      }
    }

    // Ordenar clichés cronológicamente por posición en el texto
    clichesGlobales.sort((a, b) => a.posicion - b.posicion);

    const densidadCliches =
      totalPalabras > 0
        ? Math.round((clichesGlobales.length / (totalPalabras / 100)) * 100) / 100
        : 0;

    // 9. Tiempo acumulado
    const tiempoProcesamientoMs = fragmentosResultados.reduce(
      (acc, item) => acc + item.resultado.tiempoProcesamientoMs,
      0
    );

    // 10. Métricas consolidadas
    const metricas: MetricasDeteccion = {
      perplejidad: perplejidadPonderada,
      perplejidadCruda: perplejidadCrudaPonderada,
      burstiness: cadenciaGlobal.burstiness,
      coeficienteVariacion: cadenciaGlobal.coeficienteVariacion,
      diversidadLexica: diversidadGlobal.ttr,
      densidadCliches,
      clichesDetectados: clichesGlobales,
      totalOraciones,
      totalPalabras,
      promedioPalabrasPorOracion: cadenciaGlobal.longitudMedia
    };

    // 11. Diagnóstico explicativo consolidado
    const totalFragmentos = fragmentosResultados.length;
    let diagnosticoResumen = '';

    if (clasificacionGlobal === ClasificacionIA.ALTAMENTE_PROBABLE_IA) {
      diagnosticoResumen = `Análisis consolidado (${totalFragmentos} bloques, ${totalPalabras} palabras): El documento muestra un patrón marcadamente sintético (${probabilidadGlobalIA}% probabilidad global IA). Presenta cadencia uniforme (burstiness ${metricas.burstiness}/100) y ${clichesGlobales.length} huellas típicas de modelos de lenguaje.`;
    } else if (clasificacionGlobal === ClasificacionIA.MIXTO_DUDOSO) {
      diagnosticoResumen = `Análisis consolidado (${totalFragmentos} bloques, ${totalPalabras} palabras): El documento presenta características mixtas (${probabilidadGlobalIA}% sospecha global). Existen pasajes fluidos combinados con secciones de regularidad predecible.`;
    } else {
      diagnosticoResumen = `Análisis consolidado (${totalFragmentos} bloques, ${totalPalabras} palabras): El documento refleja una autoría predominantemente humana (${probabilidadGlobalIA}% probabilidad IA). Gran variabilidad orgánica (burstiness ${metricas.burstiness}/100) y ausencia de patrones rígidos.`;
    }

    return {
      textoOriginal: textoDocumento,
      probabilidadGlobalIA,
      clasificacionGlobal,
      etiquetaClasificacion,
      metricas,
      oraciones: oracionesGlobales,
      parrafos: parrafosGlobales,
      diagnosticoResumen,
      tiempoProcesamientoMs: Math.round(tiempoProcesamientoMs * 100) / 100,
      timestamp: new Date().toISOString()
    };
  }
}
