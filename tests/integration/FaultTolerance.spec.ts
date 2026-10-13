import { describe, it, expect } from 'vitest';
import { DetectorService } from '../../src/core/services/DetectorService';
import { HumanizadorService } from '../../src/core/services/HumanizadorService';
import { ErrorTextoVacio, ErrorTextoExcedeLimite } from '../../src/core/domain/errors/ErroresDominio';
import { ModoHumanizacion } from '../../src/core/domain/enums/ModoHumanizacion';

describe('Pruebas de Tolerancia a Fallos y Casos Límite', () => {
  const detector = new DetectorService();
  const humanizador = new HumanizadorService(detector);

  it('debe rechazar textos vacíos, tabs y saltos de línea con ErrorTextoVacio', async () => {
    const vacios = ['', '   ', '\t\t\n\n\r\n', '         '];
    for (const v of vacios) {
      await expect(detector.analizar(v)).rejects.toThrow(ErrorTextoVacio);
      await expect(humanizador.humanizar(v)).rejects.toThrow(ErrorTextoVacio);
    }
  });

  it('debe procesar adecuadamente textos con emojis, caracteres especiales y puntuación irregular', async () => {
    const textoConEmojis =
      '¡Hola mundo! 🚀 Este es un mensaje con emojis 🎉✨ y símbolos especiales: #@%&*()[]{}... ' +
      '¿Funcionará sin problemas? Claro que sí, la robustez del sistema lo tolera.';

    const resultado = await detector.analizar(textoConEmojis);
    expect(resultado).toBeDefined();
    expect(resultado.metricas.totalOraciones).toBeGreaterThanOrEqual(2);
    expect(resultado.probabilidadGlobalIA).toBeGreaterThan(0);

    const resHum = await humanizador.humanizar(textoConEmojis, ModoHumanizacion.LIGERO);
    expect(resHum.textoHumanizado).toBeDefined();
    expect(resHum.textoHumanizado).toContain('🚀');
  });

  it('debe rechazar textos que excedan el límite de caracteres (> 50,000 caracteres / ~10,000 palabras)', async () => {
    const textoGigante = 'oracion repetida de prueba con varias palabras. '.repeat(1200); // ~57,600 caracteres
    expect(textoGigante.length).toBeGreaterThan(50000);

    await expect(detector.analizar(textoGigante)).rejects.toThrow(ErrorTextoExcedeLimite);
    await expect(humanizador.humanizar(textoGigante)).rejects.toThrow(ErrorTextoExcedeLimite);
  });

  it('debe procesar un texto de 4,000 palabras dentro del límite de forma eficiente y sin bloqueos', async () => {
    const textoGrande = 'En un día soleado de primavera, las personas salían a caminar tranquilamente por el parque. '.repeat(200);
    expect(textoGrande.length).toBeLessThan(50000);

    const inicio = performance.now();
    const res = await detector.analizar(textoGrande);
    const duracion = performance.now() - inicio;

    expect(res).toBeDefined();
    expect(res.metricas.totalOraciones).toBe(200);
    // Debe procesar en menos de 2.5 segundos
    expect(duracion).toBeLessThan(2500);
  });
});
