/**
 * Representa un fragmento (chunk) de texto con sus límites semánticos y offsets originales.
 */
export interface FragmentoTexto {
  /**
   * Índice posicional del fragmento (0-indexado).
   */
  indice: number;

  /**
   * Contenido textual literal del fragmento.
   */
  texto: string;

  /**
   * Índice de carácter de inicio relativo al documento original.
   */
  inicio: number;

  /**
   * Índice de carácter de fin relativo al documento original.
   */
  fin: number;

  /**
   * Número total de caracteres del fragmento.
   */
  totalCaracteres: number;

  /**
   * Número total de palabras calculadas en el fragmento.
   */
  totalPalabras: number;
}

export interface OpcionesChunking {
  /**
   * Tamaño objetivo deseado de cada fragmento en caracteres (por defecto 12.000).
   */
  tamanoObjetivoCaracteres?: number;

  /**
   * Tamaño máximo tolerable antes de forzar un corte (por defecto 15.000).
   */
  tamanoMaximoCaracteres?: number;

  /**
   * Tamaño mínimo de un fragmento residual (por defecto 2.500).
   */
  tamanoMinimoCaracteres?: number;
}

export interface SegmentadorChunking {
  dividirEnFragmentos(texto: string, opciones?: OpcionesChunking): FragmentoTexto[];
}
