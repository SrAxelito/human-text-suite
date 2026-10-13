import { FragmentoTexto } from './SegmentadorChunking';
import { ResultadoAnalisis } from '../entities/ResultadoAnalisis';

/**
 * Estados del ciclo de vida del procesamiento por lotes.
 */
export type EstadoProcesoLote = 'iniciando' | 'procesando' | 'completado' | 'cancelado' | 'error';

/**
 * Evento emitido en tiempo real durante la ejecución del lote de fragmentos.
 */
export interface EventoProgresoLote {
  /**
   * Porcentaje total de avance completado (0 - 100).
   */
  progreso: number;

  /**
   * Número ordinal del fragmento actual en ejecución (1-indexado).
   */
  fragmentoActual: number;

  /**
   * Cantidad total de fragmentos calculados para el documento.
   */
  totalFragmentos: number;

  /**
   * Tiempo estimado restante para completar el análisis en segundos.
   */
  tiempoEstimadoSegundos: number;

  /**
   * Tiempo transcurrido acumulado en milisegundos.
   */
  tiempoTranscurridoMs: number;

  /**
   * Estado actual del orquestador.
   */
  estado: EstadoProcesoLote;

  /**
   * Fragmento actualmente procesado.
   */
  fragmento?: FragmentoTexto;

  /**
   * Resultado del análisis del fragmento individual más reciente.
   */
  resultadoParcialFragmento?: ResultadoAnalisis;

  /**
   * Resultado acumulado y consolidado de todos los fragmentos procesados hasta el momento.
   */
  resultadoAcumulado?: ResultadoAnalisis;

  /**
   * Mensaje descriptivo del avance para la interfaz de usuario.
   */
  mensaje?: string;
}

/**
 * Opciones de configuración para el procesamiento asíncrono en lotes.
 */
export interface OpcionesProcesamientoLote {
  /**
   * Umbral en caracteres bajo el cual se analiza directamente sin dividir en fragmentos (por defecto 15.000).
   */
  umbralDirectoCaracteres?: number;

  /**
   * Callback invocado en cada actualización del progreso.
   */
  onProgreso?: (evento: EventoProgresoLote) => void;

  /**
   * Señal de aborto para cancelar la ejecución de forma limpia.
   */
  signal?: AbortSignal;

  /**
   * Sensibilidad del detector de IA (1 a 10).
   */
  sensibilidad?: number;
}

/**
 * Encapsula la relación entre un fragmento procesado y su resultado de análisis.
 */
export interface FragmentoResultado {
  fragmento: FragmentoTexto;
  resultado: ResultadoAnalisis;
  advertencia?: string;
}

/**
 * Contrato del servicio orquestador de lotes.
 */
export interface ProcesadorLotes {
  procesarDocumento(texto: string, opciones?: OpcionesProcesamientoLote): Promise<ResultadoAnalisis>;
}
