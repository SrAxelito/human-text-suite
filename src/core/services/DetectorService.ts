import {
  AnalizadorTexto,
  OpcionesAnalisis,
  ResultadoAnalisis,
  OracionAnalizada,
  ParrafoAnalizado,
  MetricasDeteccion,
  ClasificacionIA,
  clasificarProbabilidad,
  obtenerEtiquetaClasificacion,
  ErrorTextoVacio,
  ErrorTextoExcedeLimite
} from '../domain';
import { SentenceSplitter } from '../infrastructure/nlp/SentenceSplitter';
import { Tokenizer } from '../infrastructure/nlp/Tokenizer';
import { PerplexityCalculator } from '../infrastructure/nlp/PerplexityCalculator';
import { BurstinessCalculator } from '../infrastructure/nlp/BurstinessCalculator';
import { LLMMarkersDetector } from '../infrastructure/nlp/LLMMarkersDetector';
import { ConfigService } from '../infrastructure/config/ConfigService';

export class DetectorService implements AnalizadorTexto {
  private splitter: SentenceSplitter;
  private perplexityCalc: PerplexityCalculator;
  private burstinessCalc: BurstinessCalculator;
  private config: ConfigService;

  constructor(
    splitter?: SentenceSplitter,
    perplexityCalc?: PerplexityCalculator,
    burstinessCalc?: BurstinessCalculator,
    config?: ConfigService
  ) {
    this.splitter = splitter || new SentenceSplitter();
    this.perplexityCalc = perplexityCalc || new PerplexityCalculator();
    this.burstinessCalc = burstinessCalc || new BurstinessCalculator();
    this.config = config || ConfigService.obtenerInstancia();
  }

  public async analizar(texto: string, opciones?: OpcionesAnalisis): Promise<ResultadoAnalisis> {
    const inicioTiempo = performance.now();

    // 1. Validaciones del texto de entrada
    if (!texto || texto.trim().length === 0) {
      throw new ErrorTextoVacio();
    }

    if (texto.length > this.config.longitudMaximaTexto) {
      throw new ErrorTextoExcedeLimite(this.config.longitudMaximaTexto, texto.length);
    }

    // 2. Segmentación de oraciones y párrafos
    const segmentosParrafos = this.splitter.segmentarParrafos(texto);
    const segmentosOraciones = this.splitter.segmentarOraciones(texto);

    const textosOraciones = segmentosOraciones.map((s) => s.texto);
    const todasLasPalabras = Tokenizer.tokenizarPalabras(texto);

    // 3. Cálculos de métricas globales
    const resPerplejidad = this.perplexityCalc.calcularPerplejidadTexto(texto);
    const resBurstiness = this.burstinessCalc.calcularCadencia(textosOraciones);
    const resCliches = LLMMarkersDetector.detectarMarcadores(texto);
    const resDiversidad = Tokenizer.calcularDiversidadLexica(todasLasPalabras);

    // 4. Ponderación del score global de IA
    const pesoPpl = this.config.pesoPerplejidad;
    const pesoBurst = this.config.pesoBurstiness;
    const pesoCliche = this.config.pesoCliches;

    // Ensamble probabilístico
    let scoreGlobal =
      resPerplejidad.probabilidadIASugerida * pesoPpl +
      resBurstiness.probabilidadIASugerida * pesoBurst +
      resCliches.probabilidadIASugerida * pesoCliche;

    // Boost de ensamble: Si convergen simultáneamente clichés altos y monotonía de oraciones
    if (resCliches.clichesDetectados.length >= 3 && resBurstiness.coeficienteVariacion < 0.25) {
      scoreGlobal = Math.max(scoreGlobal, 82);
    } else if (resCliches.clichesDetectados.length >= 2 && resBurstiness.coeficienteVariacion < 0.35) {
      scoreGlobal = Math.max(scoreGlobal, 72);
    }

    // Si el texto humano tiene alta variabilidad y 0 clichés
    if (resCliches.clichesDetectados.length === 0 && resBurstiness.coeficienteVariacion > 0.45) {
      scoreGlobal = Math.min(scoreGlobal, 35);
    }

    // Ajuste de sensibilidad opcional
    if (opciones?.sensibilidad !== undefined) {
      const factorSensibilidad = (opciones.sensibilidad - 1) * 10;
      scoreGlobal += factorSensibilidad;
    }

    // Acotar entre 1 y 99%
    const probabilidadGlobalIA = Math.min(99, Math.max(1, Math.round(scoreGlobal)));
    const clasificacionGlobal = clasificarProbabilidad(probabilidadGlobalIA);
    const etiquetaClasificacion = obtenerEtiquetaClasificacion(clasificacionGlobal);

    // 5. Análisis granular por oración
    const oracionesAnalizadas: OracionAnalizada[] = segmentosOraciones.map((seg, idx) => {
      const tokensOracion = Tokenizer.tokenizarPalabras(seg.texto);
      const resPplLocal = this.perplexityCalc.calcularPerplejidad(tokensOracion);
      const evalMarcas = LLMMarkersDetector.evaluarOracion(seg.texto);

      // Desviación de longitud respecto a la media
      const diffLongitud = Math.abs(tokensOracion.length - resBurstiness.longitudMedia);
      const longitudUniforme = diffLongitud < 3 && tokensOracion.length >= 12;

      let scoreOracion = resPplLocal.probabilidadIASugerida * 0.5 + evalMarcas.factorPenalizacion;
      if (longitudUniforme && resBurstiness.coeficienteVariacion < 0.35) {
        scoreOracion += 15;
      }

      const probOracion = Math.min(99, Math.max(1, Math.round(scoreOracion)));
      const clasifOracion = clasificarProbabilidad(probOracion);

      let diagnostico = 'Cadencia y transición con estilo natural.';
      if (clasifOracion === ClasificacionIA.ALTAMENTE_PROBABLE_IA) {
        diagnostico = evalMarcas.marcas.length > 0
          ? `Detectados patrones sintéticos: ${evalMarcas.marcas.join(', ')}.`
          : 'Estructura sintáctica altamente predecible y uniforme.';
      } else if (clasifOracion === ClasificacionIA.MIXTO_DUDOSO) {
        diagnostico = 'Estructura formal con cierta monotonía o léxico predecible.';
      }

      return {
        indice: idx,
        texto: seg.texto,
        inicio: seg.inicio,
        fin: seg.fin,
        conteoPalabras: tokensOracion.length,
        perplejidadLocal: resPplLocal.perplejidadNormalizada,
        probabilidadIA: probOracion,
        clasificacion: clasifOracion,
        marcasDetectadas: evalMarcas.marcas,
        diagnostico
      };
    });

    // 6. Agrupación por párrafos
    const parrafosAnalizados: ParrafoAnalizado[] = segmentosParrafos.map((pSeg, pIdx) => {
      const oracionesDelParrafo = oracionesAnalizadas.filter(
        (o) => o.inicio >= pSeg.inicio && o.fin <= pSeg.fin
      );

      const promProbParrafo = oracionesDelParrafo.length > 0
        ? Math.round(
            oracionesDelParrafo.reduce((sum, o) => sum + o.probabilidadIA, 0) /
              oracionesDelParrafo.length
          )
        : probabilidadGlobalIA;

      return {
        indice: pIdx,
        texto: pSeg.texto,
        inicio: pSeg.inicio,
        fin: pSeg.fin,
        probabilidadIA: promProbParrafo,
        clasificacion: clasificarProbabilidad(promProbParrafo),
        oraciones: oracionesDelParrafo
      };
    });

    // 7. Síntesis explicativa para el usuario
    const diagnosticoResumen = this.generarDiagnosticoResumen(
      probabilidadGlobalIA,
      clasificacionGlobal,
      resPerplejidad.perplejidadNormalizada,
      resBurstiness.burstiness,
      resCliches.clichesDetectados.length
    );

    const metricas: MetricasDeteccion = {
      perplejidad: resPerplejidad.perplejidadNormalizada,
      perplejidadCruda: resPerplejidad.perplejidadCruda,
      burstiness: resBurstiness.burstiness,
      coeficienteVariacion: resBurstiness.coeficienteVariacion,
      diversidadLexica: resDiversidad.ttr,
      densidadCliches: resCliches.densidadCliches,
      clichesDetectados: resCliches.clichesDetectados,
      totalOraciones: segmentosOraciones.length,
      totalPalabras: todasLasPalabras.length,
      promedioPalabrasPorOracion: resBurstiness.longitudMedia
    };

    const finTiempo = performance.now();

    return {
      textoOriginal: texto,
      probabilidadGlobalIA,
      clasificacionGlobal,
      etiquetaClasificacion,
      metricas,
      oraciones: oracionesAnalizadas,
      parrafos: parrafosAnalizados,
      diagnosticoResumen,
      tiempoProcesamientoMs: Math.round((finTiempo - inicioTiempo) * 100) / 100,
      timestamp: new Date().toISOString()
    };
  }

  private generarDiagnosticoResumen(
    probabilidadIA: number,
    clasificacion: ClasificacionIA,
    perplejidad: number,
    burstiness: number,
    clichesCount: number
  ): string {
    if (clasificacion === ClasificacionIA.ALTAMENTE_PROBABLE_IA) {
      return `El texto muestra una marcada regularidad artificial (${probabilidadIA}% probabilidad IA). Presenta baja entropía léxica (perplejidad ${perplejidad}/100), cadencia monótona uniforme (burstiness ${burstiness}/100) y ${clichesCount} huellas o conectores clichés típicos de modelos de lenguaje.`;
    }

    if (clasificacion === ClasificacionIA.MIXTO_DUDOSO) {
      return `El texto presenta características híbridas (${probabilidadIA}% sospecha). Aunque mantiene cierta variabilidad sintáctica (burstiness ${burstiness}/100), se aprecian fragmentos con estructura predecible o fórmulas hiper-formales.`;
    }

    return `El texto presenta un patrón genuinamente orgánico (${probabilidadIA}% probabilidad IA). Destaca por su alta variabilidad de ritmo (burstiness ${burstiness}/100), fluidez natural y ausencia de conectores sintéticos artificiales.`;
  }
}
