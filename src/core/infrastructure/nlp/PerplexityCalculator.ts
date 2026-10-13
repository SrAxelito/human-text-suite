import { NGramLanguageModel } from './NGramLanguageModel';

export class PerplexityCalculator {
  private modelo: NGramLanguageModel;

  constructor(modelo?: NGramLanguageModel) {
    this.modelo = modelo || new NGramLanguageModel();
  }

  /**
   * Calcula la perplejidad y probabilidad de predictibilidad artificial para una cadena de texto.
   */
  public calcularPerplejidadTexto(texto: string): {
    perplejidadCruda: number;
    perplejidadNormalizada: number;
    probabilidadIASugerida: number;
  } {
    if (!texto || texto.trim().length === 0) {
      return { perplejidadCruda: 20, perplejidadNormalizada: 50, probabilidadIASugerida: 50 };
    }

    const entropia = this.modelo.calcularEntropiaPromedio(texto);
    const perplejidadCruda = Math.exp(entropia);

    // Normalización 0 - 100:
    // Entropía baja (< 2.8) => Muy predecible (IA típica, perplejidad baja)
    // Entropía alta (> 3.8) => Alta sorpresa / variabilidad humana
    const normalizada = Math.min(100, Math.max(0, Math.round(((entropia - 2.0) / 2.2) * 100)));

    // Probabilidad sugerida de IA según perplejidad:
    // A menor perplejidad/entropía -> mayor probabilidad de IA
    const z = (3.25 - entropia) * 3.5;
    const probIA = Math.min(95, Math.max(10, (1 / (1 + Math.exp(-z))) * 100));

    return {
      perplejidadCruda: Math.round(perplejidadCruda * 10) / 10,
      perplejidadNormalizada: normalizada,
      probabilidadIASugerida: Math.round(probIA * 10) / 10
    };
  }

  /**
   * Sobrecarga para compatibilidad con arreglo de tokens.
   */
  public calcularPerplejidad(tokens: string[]): {
    perplejidadCruda: number;
    perplejidadNormalizada: number;
    probabilidadIASugerida: number;
  } {
    return this.calcularPerplejidadTexto(tokens.join(' '));
  }

  public calcularParaOracion(textoOracion: string): {
    perplejidadCruda: number;
    perplejidadNormalizada: number;
    probabilidadIASugerida: number;
  } {
    return this.calcularPerplejidadTexto(textoOracion);
  }
}
