import { describe, it, expect } from 'vitest';
import { MetricasAggregator } from '../../src/core/services/MetricasAggregator';
import { FragmentoResultado } from '../../src/core/domain/interfaces/ProcesadorLotes';
import { ClasificacionIA } from '../../src/core/domain/enums/ClasificacionIA';
import { ResultadoAnalisis } from '../../src/core/domain/entities/ResultadoAnalisis';

describe('MetricasAggregator - Consolidación Global de Métricas', () => {
  const aggregator = new MetricasAggregator();

  const crearResultadoMock = (
    texto: string,
    probabilidadIA: number,
    palabras: number,
    perplejidad: number
  ): ResultadoAnalisis => ({
    textoOriginal: texto,
    probabilidadGlobalIA: probabilidadIA,
    clasificacionGlobal: probabilidadIA > 65 ? ClasificacionIA.ALTAMENTE_PROBABLE_IA : ClasificacionIA.PROBABLEMENTE_HUMANO,
    etiquetaClasificacion: probabilidadIA > 65 ? 'Probable IA' : 'Humano',
    metricas: {
      perplejidad,
      perplejidadCruda: perplejidad,
      burstiness: 60,
      coeficienteVariacion: 0.4,
      diversidadLexica: 65,
      densidadCliches: 1,
      clichesDetectados: [
        {
          marcador: 'en conclusion',
          categoria: 'conector_academico',
          posicion: 5
        }
      ],
      totalOraciones: 2,
      totalPalabras: palabras,
      promedioPalabrasPorOracion: palabras / 2
    },
    oraciones: [
      {
        indice: 0,
        texto: 'Primera oracion de prueba.',
        inicio: 0,
        fin: 26,
        conteoPalabras: Math.floor(palabras / 2),
        perplejidadLocal: perplejidad,
        probabilidadIA,
        clasificacion: ClasificacionIA.PROBABLEMENTE_HUMANO,
        marcasDetectadas: [],
        diagnostico: 'Oracion de prueba'
      },
      {
        indice: 1,
        texto: 'Segunda oracion de prueba con contenido.',
        inicio: 27,
        fin: 67,
        conteoPalabras: Math.ceil(palabras / 2),
        perplejidadLocal: perplejidad,
        probabilidadIA,
        clasificacion: ClasificacionIA.PROBABLEMENTE_HUMANO,
        marcasDetectadas: [],
        diagnostico: 'Oracion de prueba'
      }
    ],
    parrafos: [
      {
        indice: 0,
        texto: texto,
        inicio: 0,
        fin: texto.length,
        probabilidadIA,
        clasificacion: ClasificacionIA.PROBABLEMENTE_HUMANO,
        oraciones: []
      }
    ],
    diagnosticoResumen: 'Resumen mock',
    tiempoProcesamientoMs: 15,
    timestamp: new Date().toISOString()
  });

  it('debe consolidar dos fragmentos remapeando los offsets globales exactamente', () => {
    const chunk1Texto = 'Primera oracion de prueba. Segunda oracion de prueba con contenido.\n\n';
    const chunk2Texto = 'Tercera oracion de prueba. Cuarta oracion de prueba con contenido.';
    const textoCompleto = chunk1Texto + chunk2Texto;

    const fragmentos: FragmentoResultado[] = [
      {
        fragmento: {
          indice: 0,
          texto: chunk1Texto,
          inicio: 0,
          fin: chunk1Texto.length,
          totalCaracteres: chunk1Texto.length,
          totalPalabras: 10
        },
        resultado: crearResultadoMock(chunk1Texto, 80, 10, 30)
      },
      {
        fragmento: {
          indice: 1,
          texto: chunk2Texto,
          inicio: chunk1Texto.length,
          fin: textoCompleto.length,
          totalCaracteres: chunk2Texto.length,
          totalPalabras: 10
        },
        resultado: crearResultadoMock(chunk2Texto, 20, 10, 70)
      }
    ];

    const consolidado = aggregator.consolidar(fragmentos, textoCompleto);

    expect(consolidado.textoOriginal).toBe(textoCompleto);
    expect(consolidado.oraciones.length).toBe(4);

    // Oraciones del chunk 1
    expect(consolidado.oraciones[0].inicio).toBe(0);
    expect(consolidado.oraciones[0].fin).toBe(26);
    expect(consolidado.oraciones[0].indice).toBe(0);

    // Oraciones del chunk 2 deben tener offset desplazado por chunk1Texto.length
    expect(consolidado.oraciones[2].inicio).toBe(chunk1Texto.length + 0);
    expect(consolidado.oraciones[2].fin).toBe(chunk1Texto.length + 26);
    expect(consolidado.oraciones[2].indice).toBe(2);

    expect(consolidado.oraciones[3].inicio).toBe(chunk1Texto.length + 27);
    expect(consolidado.oraciones[3].fin).toBe(chunk1Texto.length + 67);
    expect(consolidado.oraciones[3].indice).toBe(3);

    // Verificación de probabilidad ponderada (80 * 10 + 20 * 10) / 20 = 50
    expect(consolidado.probabilidadGlobalIA).toBe(50);
    expect(consolidado.metricas.totalPalabras).toBe(20);
    expect(consolidado.metricas.totalOraciones).toBe(4);

    // Clichés remapeados con offset
    expect(consolidado.metricas.clichesDetectados.length).toBe(2);
    expect(consolidado.metricas.clichesDetectados[0].posicion).toBe(5);
    expect(consolidado.metricas.clichesDetectados[1].posicion).toBe(chunk1Texto.length + 5);
  });

  it('debe arrojar error si no se envían fragmentos para consolidar', () => {
    expect(() => aggregator.consolidar([])).toThrow('No se proporcionaron fragmentos');
  });
});
