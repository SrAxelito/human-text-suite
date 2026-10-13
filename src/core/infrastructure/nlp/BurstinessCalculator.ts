import { Tokenizer } from './Tokenizer';

export interface MetricasCadencia {
  burstiness: number; // 0 - 100 (más alto = más humano)
  coeficienteVariacion: number;
  desviacionEstandar: number;
  longitudMedia: number;
  longitudMinima: number;
  longitudMaxima: number;
  varianzaSaltos: number;
  probabilidadIASugerida: number; // 0 - 100 (más alto = más IA)
}

export class BurstinessCalculator {
  /**
   * Calcula el burstiness y la métrica de variación de cadencia sobre un conjunto de oraciones.
   */
  public calcularCadencia(oraciones: string[]): MetricasCadencia {
    if (oraciones.length === 0) {
      return {
        burstiness: 50,
        coeficienteVariacion: 0,
        desviacionEstandar: 0,
        longitudMedia: 0,
        longitudMinima: 0,
        longitudMaxima: 0,
        varianzaSaltos: 0,
        probabilidadIASugerida: 50
      };
    }

    // Longitud en palabras de cada oración
    const longitudes = oraciones.map((o) => Tokenizer.tokenizarPalabras(o).length);
    const n = longitudes.length;

    // Caso de una sola oración: evaluamos variabilidad interna de cláusulas y comas
    if (n === 1) {
      const longUnica = longitudes[0];
      const comas = (oraciones[0].match(/[,;:]/g) || []).length;
      const tieneVariabilidadInterna = comas >= 1 && longUnica >= 12;
      const burstinessMono = tieneVariabilidadInterna ? 60 : 45;
      return {
        burstiness: burstinessMono,
        coeficienteVariacion: 0.35,
        desviacionEstandar: 0,
        longitudMedia: longUnica,
        longitudMinima: longUnica,
        longitudMaxima: longUnica,
        varianzaSaltos: 0,
        probabilidadIASugerida: tieneVariabilidadInterna ? 40 : 55
      };
    }

    const suma = longitudes.reduce((acc, curr) => acc + curr, 0);
    const media = suma / n;

    const sumaCuadrados = longitudes.reduce((acc, curr) => acc + Math.pow(curr - media, 2), 0);
    const varianza = sumaCuadrados / n;
    const desviacion = Math.sqrt(varianza);

    // Coeficiente de variación CV = sigma / media
    const cv = media > 0 ? desviacion / media : 0;

    // Variabilidad de saltos entre oraciones consecutivas |L_i - L_{i-1}|
    let sumaSaltos = 0;
    for (let i = 1; i < n; i++) {
      sumaSaltos += Math.abs(longitudes[i] - longitudes[i - 1]);
    }
    const saltoPromedio = sumaSaltos / (n - 1);

    // Escala de Burstiness (0 - 100):
    // CV < 0.25 => Muy bajo (monotonía de IA típica)
    // CV entre 0.30 y 0.50 => Moderado
    // CV > 0.55 => Alto / Orgánico humano
    // Mapeo no lineal del coeficiente de variación
    const burstinessNormalizado = Math.min(100, Math.max(0, Math.round(cv * 130 + (saltoPromedio / (media || 1)) * 25)));

    // Probabilidad de IA sugerida por burstiness:
    // CV bajo (< 0.28) -> Alta probabilidad de IA (75% - 90%)
    // CV alto (> 0.60) -> Baja probabilidad de IA (10% - 30%)
    let probIA = 0;
    if (cv < 0.25) {
      probIA = 85 - cv * 60;
    } else if (cv < 0.50) {
      probIA = 70 - (cv - 0.25) * 120;
    } else {
      probIA = Math.max(10, 40 - (cv - 0.50) * 45);
    }

    return {
      burstiness: burstinessNormalizado,
      coeficienteVariacion: Math.round(cv * 1000) / 1000,
      desviacionEstandar: Math.round(desviacion * 100) / 100,
      longitudMedia: Math.round(media * 100) / 100,
      longitudMinima: Math.min(...longitudes),
      longitudMaxima: Math.max(...longitudes),
      varianzaSaltos: Math.round(saltoPromedio * 100) / 100,
      probabilidadIASugerida: Math.round(probIA * 100) / 100
    };
  }
}
