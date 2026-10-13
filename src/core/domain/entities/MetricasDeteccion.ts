/**
 * Métricas estadísticas y probabilísticas calculadas durante el análisis.
 */
export interface MetricasDeteccion {
  /**
   * Perplejidad normalizada (0 - 100).
   * Valores bajos indican alta predictibilidad (típico de LLMs).
   * Valores altos indican mayor sorpresa/entropía (típico humano).
   */
  perplejidad: number;

  /**
   * Perplejidad cruda (métrica exponencial basada en n-gramas).
   */
  perplejidadCruda: number;

  /**
   * Cadencia y variabilidad sintáctica (0 - 100).
   * Varianza y coeficiente de variación en la longitud y ritmo de las oraciones.
   * Valores bajos = oraciones de longitud monótona (IA).
   * Valores altos = gran oscilación de ritmo (Humano).
   */
  burstiness: number;

  /**
   * Coeficiente de variación de longitud de oraciones (desviación / media).
   */
  coeficienteVariacion: number;

  /**
   * Diversidad léxica medida mediante Type-Token Ratio (TTR) (0 - 100).
   * Riqueza de vocabulario único frente al total de palabras.
   */
  diversidadLexica: number;

  /**
   * Densidad de huellas, conectores clichés y muletillas típicas de LLM (0 - 100).
   */
  densidadCliches: number;

  /**
   * Lista de marcadores/clichés encontrados en el texto analizado.
   */
  clichesDetectados: Array<{
    marcador: string;
    categoria: 'conector_academico' | 'muletilla_llm' | 'estructura_formulaica';
    posicion: number;
  }>;

  /**
   * Conteo total de oraciones procesadas.
   */
  totalOraciones: number;

  /**
   * Conteo total de palabras procesadas.
   */
  totalPalabras: number;

  /**
   * Promedio de palabras por oración.
   */
  promedioPalabrasPorOracion: number;
}
