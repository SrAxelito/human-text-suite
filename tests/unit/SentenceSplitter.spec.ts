import { describe, it, expect } from 'vitest';
import { SentenceSplitter } from '../../src/core/infrastructure/nlp/SentenceSplitter';

describe('SentenceSplitter - Segmentador de Texto', () => {
  const splitter = new SentenceSplitter();

  it('debe devolver arreglo vacío ante texto vacío o solo espacios', () => {
    expect(splitter.segmentarOraciones('')).toEqual([]);
    expect(splitter.segmentarOraciones('   \n  \t ')).toEqual([]);
    expect(splitter.segmentarParrafos('')).toEqual([]);
  });

  it('debe respetar abreviaturas comunes y no dividir prematuramente', () => {
    const texto = 'El Dr. Gómez y el Prof. Martínez hablaron del proyecto, etc. Fue una reunión exitosa.';
    const oraciones = splitter.segmentarOraciones(texto);

    expect(oraciones.length).toBe(2);
    expect(oraciones[0].texto).toContain('Dr. Gómez');
    expect(oraciones[0].texto).toContain('etc.');
    expect(oraciones[1].texto).toBe('Fue una reunión exitosa.');
  });

  it('debe preservar números con punto decimal', () => {
    const texto = 'La versión 2.5 del sistema aumentó un 14.8% en rendimiento. Todo funciona bien.';
    const oraciones = splitter.segmentarOraciones(texto);

    expect(oraciones.length).toBe(2);
    expect(oraciones[0].texto).toContain('2.5');
    expect(oraciones[0].texto).toContain('14.8%');
  });

  it('debe manejar signos de exclamación, interrogación y puntos suspensivos', () => {
    const texto = '¿Cómo estás? ¡Muy bien, gracias! Esperaba verte hoy... y al final pudiste venir.';
    const oraciones = splitter.segmentarOraciones(texto);

    expect(oraciones.length).toBe(3);
    expect(oraciones[0].texto).toBe('¿Cómo estás?');
    expect(oraciones[1].texto).toBe('¡Muy bien, gracias!');
    expect(oraciones[2].texto).toContain('Esperaba verte hoy...');
  });

  it('debe segmentar párrafos y calcular offsets exactos de oraciones', () => {
    const texto = 'Párrafo uno oracion uno. Párrafo uno oracion dos.\n\nPárrafo dos oracion unica.';
    const parrafos = splitter.segmentarParrafos(texto);

    expect(parrafos.length).toBe(2);
    expect(parrafos[0].oraciones.length).toBe(2);
    expect(parrafos[1].oraciones.length).toBe(1);

    for (const p of parrafos) {
      expect(texto.slice(p.inicio, p.fin)).toBe(p.texto);
      for (const o of p.oraciones) {
        expect(texto.slice(o.inicio, o.fin)).toBe(o.texto);
      }
    }
  });
});
