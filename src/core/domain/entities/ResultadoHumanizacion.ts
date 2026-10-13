import { ModoHumanizacion } from '../enums/ModoHumanizacion';
import { ResultadoAnalisis } from './ResultadoAnalisis';
import { DiferenciaTexto } from './DiferenciaTexto';

/**
 * Salida estructurada del proceso de humanización, incluyendo reanálisis automático.
 */
export interface ResultadoHumanizacion {
  /**
   * Texto de entrada previo a la transformación.
   */
  textoOriginal: string;

  /**
   * Texto reescrito con cadencia orgánica y patrones desarticulados.
   */
  textoHumanizado: string;

  /**
   * Nivel de agresividad utilizado (LIGERO, EQUILIBRADO, PROFUNDO).
   */
  modo: ModoHumanizacion;

  /**
   * Diagnóstico del texto original antes de intervenir.
   */
  analisisPrevio: ResultadoAnalisis;

  /**
   * Reanálisis automático ejecutado sobre el texto humanizado.
   */
  analisisPosterior: ResultadoAnalisis;

  /**
   * Reducción absoluta de puntos porcentuales de probabilidad de IA (Previo - Posterior).
   */
  reduccionProbabilidadIA: number;

  /**
   * Diferencia visual estructurada (diff) entre original y humanizado.
   */
  diferencias: DiferenciaTexto;

  /**
   * Resumen de transformaciones sintácticas y léxicas aplicadas.
   */
  transformacionesAplicadas: string[];

  /**
   * Tiempo de procesamiento en milisegundos.
   */
  tiempoProcesamientoMs: number;
}
