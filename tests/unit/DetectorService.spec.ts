import { describe, it, expect, beforeEach } from 'vitest';
import { DetectorService } from '../../src/core/services/DetectorService';
import { ClasificacionIA } from '../../src/core/domain/enums/ClasificacionIA';
import { ErrorTextoVacio, ErrorTextoExcedeLimite } from '../../src/core/domain/errors/ErroresDominio';

describe('DetectorService - Motor Analítico de Detección de IA', () => {
  let detector: DetectorService;

  beforeEach(() => {
    detector = new DetectorService();
  });

  const TEXTO_IA_SINTETICO = `
En resumen, la inteligencia artificial juega un papel crucial en la sociedad moderna.
Es fundamental destacar que esta tecnología permite optimizar procesos de forma sistemática y precisa.
Por consiguiente, las organizaciones deben implementar soluciones innovadoras para maximizar su eficiencia.
En última instancia, el impacto de estas herramientas resulta indiscutiblemente transformador para el futuro digital.
No solo transforma las operaciones cotidianas, sino también redefine las competencias profesionales del siglo XXI.
  `.trim();

  const TEXTO_HUMANO_CERTIFICADO = `
Ayer por la tarde salí a caminar sin rumbo fijo.
Hacía un frío tremendo. Me metí en una pequeña cafetería vieja de la esquina, de esas con mesas de madera gastadas y aroma a grano tostado recién molido.
Pedí un espresso doble y me quedé mirando la lluvia golpear contra el cristal empañado mientras garabateaba un par de ideas sueltas en mi libreta.
A veces uno solo necesita desconectar un rato del ruido del mundo y dejar que los pensamientos fluyan a su propio ritmo.
¿A quién no le ha pasado alguna vez?
  `.trim();

  it('debe detectar correctamente un texto sintético generado por IA con alta probabilidad y clasificarlo adecuadamente', async () => {
    const resultado = await detector.analizar(TEXTO_IA_SINTETICO);

    expect(resultado).toBeDefined();
    expect(resultado.probabilidadGlobalIA).toBeGreaterThanOrEqual(70);
    expect(resultado.clasificacionGlobal).toBe(ClasificacionIA.ALTAMENTE_PROBABLE_IA);
    expect(resultado.metricas.densidadCliches).toBeGreaterThan(0);
    expect(resultado.metricas.clichesDetectados.length).toBeGreaterThan(0);
    expect(resultado.oraciones.length).toBeGreaterThanOrEqual(4);
    expect(resultado.parrafos.length).toBeGreaterThanOrEqual(1);
    expect(resultado.diagnosticoResumen).toContain('regularidad artificial');
  });

  it('debe detectar un texto humano orgánico con baja probabilidad de IA y alta variabilidad de cadencia', async () => {
    const resultado = await detector.analizar(TEXTO_HUMANO_CERTIFICADO);

    expect(resultado).toBeDefined();
    expect(resultado.probabilidadGlobalIA).toBeLessThan(45);
    expect(resultado.clasificacionGlobal).not.toBe(ClasificacionIA.ALTAMENTE_PROBABLE_IA);
    expect(resultado.metricas.burstiness).toBeGreaterThan(30);
    expect(resultado.metricas.coeficienteVariacion).toBeGreaterThan(0.35);
    expect(resultado.oraciones.length).toBeGreaterThanOrEqual(4);
  });

  it('debe arrojar ErrorTextoVacio al recibir texto vacío o espacios en blanco', async () => {
    await expect(detector.analizar('')).rejects.toThrow(ErrorTextoVacio);
    await expect(detector.analizar('     \n\t  ')).rejects.toThrow(ErrorTextoVacio);
  });

  it('debe arrojar ErrorTextoExcedeLimite al superar el tamaño máximo configurado', async () => {
    const textoGigante = 'palabra '.repeat(10000); // ~80,000 caracteres
    await expect(detector.analizar(textoGigante)).rejects.toThrow(ErrorTextoExcedeLimite);
  });

  it('debe calcular offsets de caracteres consistentes para cada oración', async () => {
    const texto = 'Primera oración clara. Segunda oración con más contenido explicativo. Tercera oración.';
    const resultado = await detector.analizar(texto);

    for (const oracion of resultado.oraciones) {
      const extraido = texto.slice(oracion.inicio, oracion.fin);
      expect(extraido).toBe(oracion.texto);
    }
  });

  it('debe soportar ajuste de sensibilidad en las opciones de análisis', async () => {
    const resNormal = await detector.analizar(TEXTO_IA_SINTETICO, { sensibilidad: 1.0 });
    const resAlta = await detector.analizar(TEXTO_IA_SINTETICO, { sensibilidad: 1.5 });

    expect(resAlta.probabilidadGlobalIA).toBeGreaterThanOrEqual(resNormal.probabilidadGlobalIA);
  });
});
