import { describe, it, expect, beforeEach } from 'vitest';
import { HumanizadorService } from '../../src/core/services/HumanizadorService';
import { ModoHumanizacion } from '../../src/core/domain/enums/ModoHumanizacion';
import { ErrorTextoVacio, ErrorTextoExcedeLimite } from '../../src/core/domain/errors/ErroresDominio';
import { ConfigService } from '../../src/core/infrastructure/config/ConfigService';

describe('HumanizadorService - Pipeline de Reescritura y Humanización', () => {
  let humanizador: HumanizadorService;

  beforeEach(() => {
    humanizador = new HumanizadorService();
  });

  const TEXTO_IA_CLICHES = `
En resumen, la inteligencia artificial juega un papel crucial en la transformación empresarial.
Es fundamental destacar que este paradigma holístico permite optimizar procesos complejos.
Por consiguiente, las organizaciones deben implementar soluciones ágiles.
En última instancia, el impacto de estas herramientas resulta indiscutiblemente positivo.
No solo agiliza el flujo de trabajo, sino también empodera a los colaboradores.
  `.trim();

  it('debe reducir cuantitativamente el puntaje de IA tras el reanálisis automático', async () => {
    const resultado = await humanizador.humanizar(TEXTO_IA_CLICHES, ModoHumanizacion.EQUILIBRADO);

    expect(resultado).toBeDefined();
    expect(resultado.textoHumanizado).not.toBe(TEXTO_IA_CLICHES);
    expect(resultado.analisisPrevio.probabilidadGlobalIA).toBeGreaterThanOrEqual(70);
    // El score posterior debe ser notablemente menor
    expect(resultado.analisisPosterior.probabilidadGlobalIA).toBeLessThan(
      resultado.analisisPrevio.probabilidadGlobalIA
    );
    expect(resultado.reduccionProbabilidadIA).toBeGreaterThan(0);
    expect(resultado.transformacionesAplicadas.length).toBeGreaterThan(0);
  });

  it('debe ejecutar los tres modos de intensidad con variación de agresividad', async () => {
    const resLigero = await humanizador.humanizar(TEXTO_IA_CLICHES, ModoHumanizacion.LIGERO);
    const resEquilibrado = await humanizador.humanizar(TEXTO_IA_CLICHES, ModoHumanizacion.EQUILIBRADO);
    const resProfundo = await humanizador.humanizar(TEXTO_IA_CLICHES, ModoHumanizacion.PROFUNDO);

    expect(resLigero.modo).toBe(ModoHumanizacion.LIGERO);
    expect(resEquilibrado.modo).toBe(ModoHumanizacion.EQUILIBRADO);
    expect(resProfundo.modo).toBe(ModoHumanizacion.PROFUNDO);

    // Modo profundo debe aplicar transformaciones exhaustivas
    expect(resProfundo.transformacionesAplicadas.length).toBeGreaterThanOrEqual(
      resLigero.transformacionesAplicadas.length
    );
  });

  it('debe generar diferencias (Diff View) estructuradas con adiciones, eliminaciones y conteo', async () => {
    const resultado = await humanizador.humanizar(TEXTO_IA_CLICHES, ModoHumanizacion.EQUILIBRADO);
    const diff = resultado.diferencias;

    expect(diff).toBeDefined();
    expect(diff.fragmentos.length).toBeGreaterThan(0);
    expect(diff.palabrasEliminadas).toBeGreaterThan(0);
    expect(diff.palabrasAgregadas).toBeGreaterThan(0);
    expect(diff.palabrasSinCambio).toBeGreaterThan(0);
    expect(diff.porcentajeSimilitud).toBeGreaterThan(30);
    expect(diff.porcentajeSimilitud).toBeLessThan(100);
  });

  it('debe arrojar ErrorTextoVacio al recibir texto vacío', async () => {
    await expect(humanizador.humanizar('')).rejects.toThrow(ErrorTextoVacio);
  });

  it('debe arrojar ErrorTextoExcedeLimite al superar longitud configurada', async () => {
    const config = ConfigService.obtenerInstancia();
    const prevMax = config.longitudMaximaTexto;
    config.longitudMaximaTexto = 1000;
    try {
      const textoGigante = 'palabra '.repeat(200);
      await expect(humanizador.humanizar(textoGigante)).rejects.toThrow(ErrorTextoExcedeLimite);
    } finally {
      config.longitudMaximaTexto = prevMax;
    }
  });
});
