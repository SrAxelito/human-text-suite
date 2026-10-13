import { MetricasDeteccion } from './MetricasDeteccion';
import { OracionAnalizada } from './OracionAnalizada';
import { ParrafoAnalizado } from './ParrafoAnalizado';
import { ClasificacionIA } from '../enums/ClasificacionIA';

/**
 * Salida tipada y estructurada completa del motor de detección de IA.
 */
export interface ResultadoAnalisis {
  /**
   * Texto original analizado.
   */
  textoOriginal: string;

  /**
   * Probabilidad global calculada de autoría sintética / IA (0% a 100%).
   */
  probabilidadGlobalIA: number;

  /**
   * Categoría asignada: Altamente probable de IA | Mixto / Dudoso | Probablemente humano.
   */
  clasificacionGlobal: ClasificacionIA;

  /**
   * Etiqueta amigable en lenguaje natural.
   */
  etiquetaClasificacion: string;

  /**
   * Métricas estadísticas detalladas (Perplejidad, Burstiness, Clichés, etc.).
   */
  metricas: MetricasDeteccion;

  /**
   * Desglose granular de oraciones con sus rangos de caracteres y puntajes.
   */
  oraciones: OracionAnalizada[];

  /**
   * Desglose por párrafos del texto.
   */
  parrafos: ParrafoAnalizado[];

  /**
   * Diagnóstico explicativo comprensivo del análisis.
   */
  diagnosticoResumen: string;

  /**
   * Tiempo de procesamiento en milisegundos.
   */
  tiempoProcesamientoMs: number;

  /**
   * Fecha y hora en formato ISO 8601 del análisis.
   */
  timestamp: string;
}
