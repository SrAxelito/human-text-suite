import { ClasificacionIA } from '../enums/ClasificacionIA';

/**
 * Representa una oración individual analizada de forma granular.
 */
export interface OracionAnalizada {
  /**
   * Índice posicional de la oración en el texto (0-indexado).
   */
  indice: number;

  /**
   * Texto literal de la oración.
   */
  texto: string;

  /**
   * Índice de carácter de inicio en el texto original.
   */
  inicio: number;

  /**
   * Índice de carácter de fin en el texto original.
   */
  fin: number;

  /**
   * Número de palabras que componen la oración.
   */
  conteoPalabras: number;

  /**
   * Perplejidad local estimada para esta oración (0 - 100).
   */
  perplejidadLocal: number;

  /**
   * Probabilidad estimada de autoría por IA (0% a 100%).
   */
  probabilidadIA: number;

  /**
   * Clasificación cualitativa de la oración.
   */
  clasificacion: ClasificacionIA;

  /**
   * Lista de marcadores sintéticos o clichés detectados en esta oración.
   */
  marcasDetectadas: string[];

  /**
   * Diagnóstico explicativo conciso del puntaje asignado.
   */
  diagnostico: string;
}
