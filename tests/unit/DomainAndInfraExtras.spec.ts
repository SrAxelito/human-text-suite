import { describe, it, expect } from 'vitest';
import {
  ModoHumanizacion,
  obtenerDetalleModo,
  ErrorTimeoutAnalisis,
  ErrorModoInvalido,
  ErrorTextoVacio,
  ErrorTextoExcedeLimite
} from '../../src/core/domain';
import { ConfigService } from '../../src/core/infrastructure/config/ConfigService';
import { Tokenizer } from '../../src/core/infrastructure/nlp/Tokenizer';
import { DiffEngine } from '../../src/core/infrastructure/diff/DiffEngine';
import { SentenceRestructurer } from '../../src/core/infrastructure/rewriting/SentenceRestructurer';
import { BurstinessCalculator } from '../../src/core/infrastructure/nlp/BurstinessCalculator';
import { PerplexityCalculator } from '../../src/core/infrastructure/nlp/PerplexityCalculator';

describe('Pruebas Unitarias de Dominio e Infraestructura Adicionales', () => {
  it('debe devolver metadatos correctos para cada ModoHumanizacion', () => {
    const dLigero = obtenerDetalleModo(ModoHumanizacion.LIGERO);
    expect(dLigero.nombre).toBe('Ligero');
    expect(dLigero.intensidad).toBe(1);

    const dEqui = obtenerDetalleModo(ModoHumanizacion.EQUILIBRADO);
    expect(dEqui.nombre).toBe('Equilibrado');
    expect(dEqui.intensidad).toBe(2);

    const dProf = obtenerDetalleModo(ModoHumanizacion.PROFUNDO);
    expect(dProf.nombre).toBe('Profundo');
    expect(dProf.intensidad).toBe(3);
  });

  it('debe instanciar y verificar códigos en todas las clases de ErroresDominio', () => {
    const errVacio = new ErrorTextoVacio();
    expect(errVacio.codigo).toBe('TEXTO_VACIO');

    const errLimite = new ErrorTextoExcedeLimite(500, 600);
    expect(errLimite.codigo).toBe('TEXTO_EXCEDE_LIMITE');

    const errTimeout = new ErrorTimeoutAnalisis(1000);
    expect(errTimeout.codigo).toBe('TIMEOUT_ANALISIS');

    const errModo = new ErrorModoInvalido('DESCONOCIDO');
    expect(errModo.codigo).toBe('MODO_INVALIDO');
  });

  it('debe permitir actualizar dinámicamente la configuración en ConfigService', () => {
    const config = ConfigService.obtenerInstancia();
    const pesoPrevio = config.pesoPerplejidad;

    config.actualizarConfiguracion({ pesoPerplejidad: 0.5 });
    expect(config.pesoPerplejidad).toBe(0.5);

    // Restaurar
    config.actualizarConfiguracion({ pesoPerplejidad: pesoPrevio });
  });

  it('debe generar N-gramas con Tokenizer adecuadamente', () => {
    const tokens = ['el', 'gato', 'negro', 'duerme'];
    const bigramas = Tokenizer.generarNGramas(tokens, 2);
    expect(bigramas.length).toBe(3);
    expect(bigramas[0]).toEqual(['el', 'gato']);

    expect(Tokenizer.generarNGramas(tokens, 5)).toEqual([]);
    expect(Tokenizer.generarNGramas([], 2)).toEqual([]);
    expect(Tokenizer.calcularDiversidadLexica([])).toEqual({ ttr: 0, ttrGuiraud: 0, vocabularioUnico: 0 });
  });

  it('debe manejar casos vacíos en DiffEngine', () => {
    const diffVacio = DiffEngine.calcularDiferencias('', '');
    expect(diffVacio.palabrasAgregadas).toBe(0);
    expect(diffVacio.porcentajeSimilitud).toBe(100);
  });

  it('debe reestructurar y dividir oraciones excesivamente largas en SentenceRestructurer', () => {
    const textoLargo =
      'La implementación acelerada de sistemas distribuidos a gran escala transforma drásticamente la infraestructura tecnológica contemporánea de las compañías de software, ' +
      'lo que permite a los desarrolladores desplegar microservicios en la nube de manera mucho más eficiente y confiable.';

    const resultado = SentenceRestructurer.reestructurarSintaxis(textoLargo, ModoHumanizacion.PROFUNDO);
    expect(resultado.transformaciones.length).toBeGreaterThan(0);
  });

  it('debe evaluar oraciones únicas y casos vacíos en BurstinessCalculator y PerplexityCalculator', () => {
    const burstiness = new BurstinessCalculator();
    const cadVacia = burstiness.calcularCadencia([]);
    expect(cadVacia.burstiness).toBe(50);

    const cadUnica = burstiness.calcularCadencia(['Una oración simple y solitaria en el texto.']);
    expect(cadUnica.longitudMedia).toBeGreaterThan(0);

    const ppl = new PerplexityCalculator();
    const pplVacia = ppl.calcularPerplejidad([]);
    expect(pplVacia.probabilidadIASugerida).toBe(50);
  });
});
