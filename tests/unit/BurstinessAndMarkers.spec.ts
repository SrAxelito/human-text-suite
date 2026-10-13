import { describe, it, expect } from 'vitest';
import { BurstinessCalculator } from '../../src/core/infrastructure/nlp/BurstinessCalculator';
import { LLMMarkersDetector } from '../../src/core/infrastructure/nlp/LLMMarkersDetector';
import { Tokenizer } from '../../src/core/infrastructure/nlp/Tokenizer';

describe('BurstinessCalculator y LLMMarkersDetector', () => {
  const burstinessCalc = new BurstinessCalculator();

  it('debe detectar baja variabilidad en oraciones de longitud uniforme (patrón IA)', () => {
    // 4 oraciones de exactamente 15-16 palabras
    const oracionesUniforme = [
      'La implementación de soluciones tecnológicas modernas optimiza sustancialmente el rendimiento de los equipos de trabajo.',
      'El análisis exhaustivo de datos cuantitativos proporciona ventajas competitivas determinantes para la toma de decisiones.',
      'La integración continua de procesos automatizados reduce significativamente el margen de error en proyectos complejos.',
      'La transformación digital estratégica redefine permanentemente la interacción con clientes y usuarios de la plataforma.'
    ];

    const cadencia = burstinessCalc.calcularCadencia(oracionesUniforme);
    expect(cadencia.coeficienteVariacion).toBeLessThan(0.20);
    expect(cadencia.probabilidadIASugerida).toBeGreaterThanOrEqual(70);
  });

  it('debe detectar alta variabilidad en oraciones asimétricas (patrón Humano)', () => {
    const oracionesHumanas = [
      'Corrió rápido.', // 2 palabras
      'Sabía perfectamente que si no llegaba a tiempo perdería el último tren de la medianoche, lo que significaría dormir en la fría estación hasta el amanecer sin abrigo.', // 27 palabras
      'Tenía miedo.', // 2 palabras
      'Al final divisó las luces parpadeantes del andén.', // 8 palabras
      '¿Lo lograría?' // 2 palabras
    ];

    const cadencia = burstinessCalc.calcularCadencia(oracionesHumanas);
    expect(cadencia.coeficienteVariacion).toBeGreaterThan(0.60);
    expect(cadencia.burstiness).toBeGreaterThan(60);
    expect(cadencia.probabilidadIASugerida).toBeLessThan(40);
  });

  it('debe identificar conectores clichés y muletillas típicas de LLM', () => {
    const textoConMarcadores =
      'En resumen, es fundamental destacar que este paradigma holístico desempeña un rol fundamental en el vertiginoso mundo moderno.';
    const res = LLMMarkersDetector.detectarMarcadores(textoConMarcadores);

    expect(res.clichesDetectados.length).toBeGreaterThanOrEqual(3);
    expect(res.probabilidadIASugerida).toBeGreaterThanOrEqual(75);
  });

  it('debe calcular la diversidad léxica con TTR y Guiraud adecuadamente', () => {
    const palabrasRepetitivas = ['el', 'perro', 'el', 'perro', 'el', 'perro'];
    const resRepetitiva = Tokenizer.calcularDiversidadLexica(palabrasRepetitivas);
    expect(resRepetitiva.ttr).toBeLessThan(40);

    const palabrasVariadas = ['el', 'astronave', 'surcaba', 'cielos', 'estrellados', 'infinitos'];
    const resVariada = Tokenizer.calcularDiversidadLexica(palabrasVariadas);
    expect(resVariada.ttr).toBe(100);
  });
});
