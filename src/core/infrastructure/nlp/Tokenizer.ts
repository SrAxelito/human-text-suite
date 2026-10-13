/**
 * Tokenizador robusto optimizado para textos en español y multilingüe.
 */
export class Tokenizer {
  /**
   * Extrae palabras normalizadas en minúsculas ignorando puntuación externa.
   */
  public static tokenizarPalabras(texto: string): string[] {
    if (!texto || texto.trim().length === 0) return [];

    // Captura palabras que incluyan acentos, diéresis, ñ y apóstrofes internos
    const coincidencias = texto.toLowerCase().match(/[a-záéíóúüñA-ZÁÉÍÓÚÜÑ0-9]+(?:'[a-záéíóúüñA-ZÁÉÍÓÚÜÑ0-9]+)?/g);
    return coincidencias || [];
  }

  /**
   * Extrae n-gramas de palabras a partir de un arreglo de tokens.
   */
  public static generarNGramas(tokens: string[], n: number): string[][] {
    if (tokens.length < n || n <= 0) return [];

    const nGramas: string[][] = [];
    for (let i = 0; i <= tokens.length - n; i++) {
      nGramas.push(tokens.slice(i, i + n));
    }
    return nGramas;
  }

  /**
   * Calcula el Type-Token Ratio (TTR) y TTR suavizado por raíz de Guiraud.
   */
  public static calcularDiversidadLexica(palabras: string[]): {
    ttr: number;
    ttrGuiraud: number;
    vocabularioUnico: number;
  } {
    if (palabras.length === 0) {
      return { ttr: 0, ttrGuiraud: 0, vocabularioUnico: 0 };
    }

    const unicos = new Set(palabras);
    const vocabularioUnico = unicos.size;
    const ttr = (vocabularioUnico / palabras.length) * 100;

    // R = V / sqrt(N) normalizado en escala 0 - 100
    const guiraud = (vocabularioUnico / Math.sqrt(palabras.length)) * 10;
    const ttrGuiraud = Math.min(100, Math.max(0, guiraud));

    return {
      ttr: Math.round(ttr * 100) / 100,
      ttrGuiraud: Math.round(ttrGuiraud * 100) / 100,
      vocabularioUnico
    };
  }
}
