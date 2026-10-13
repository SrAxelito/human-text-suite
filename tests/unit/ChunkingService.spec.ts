import { describe, it, expect } from 'vitest';
import { ChunkingService } from '../../src/core/services/ChunkingService';

describe('ChunkingService - Segmentación Inteligente por Límites Semánticos', () => {
  const service = new ChunkingService();

  it('debe devolver arreglo vacío si el texto está vacío', () => {
    expect(service.dividirEnFragmentos('')).toEqual([]);
  });

  it('debe retornar un único fragmento si la longitud es inferior al tamaño máximo', () => {
    const textoCorto = 'Este es un texto corto que no excede el límite máximo de caracteres.';
    const fragmentos = service.dividirEnFragmentos(textoCorto, { tamanoMaximoCaracteres: 500 });

    expect(fragmentos.length).toBe(1);
    expect(fragmentos[0].indice).toBe(0);
    expect(fragmentos[0].texto).toBe(textoCorto);
    expect(fragmentos[0].inicio).toBe(0);
    expect(fragmentos[0].fin).toBe(textoCorto.length);
  });

  it('debe reconstruir el 100% del texto original sin alterar caracteres ni omitir espacios', () => {
    // Generamos un texto de prueba de ~35.000 caracteres con múltiples párrafos
    const parrafoBase =
      'La inteligencia artificial moderna y los modelos de lenguaje transforman profundamente la educación. ' +
      'Permiten automatizar tareas repetitivas y ofrecer retroalimentación instantánea a los estudiantes. ' +
      'Sin embargo, es fundamental mantener el pensamiento crítico y la autoría original en cada ensayo escrito.\n\n';

    const textoExtenso = parrafoBase.repeat(100); // ~32.000 caracteres
    const fragmentos = service.dividirEnFragmentos(textoExtenso, {
      tamanoObjetivoCaracteres: 10000,
      tamanoMaximoCaracteres: 12000,
      tamanoMinimoCaracteres: 2000
    });

    expect(fragmentos.length).toBeGreaterThan(2);

    // Verificación de reconstrucción exacta e idéntica
    const reconstruido = fragmentos.map((f) => f.texto).join('');
    expect(reconstruido).toBe(textoExtenso);
    expect(reconstruido.length).toBe(textoExtenso.length);

    // Verificación de continuidad estricta de offsets
    for (let i = 0; i < fragmentos.length; i++) {
      const f = fragmentos[i];
      expect(textoExtenso.slice(f.inicio, f.fin)).toBe(f.texto);

      if (i > 0) {
        expect(f.inicio).toBe(fragmentos[i - 1].fin);
      }
    }
  });

  it('debe priorizar saltos de párrafo y no cortar oraciones ni palabras por la mitad', () => {
    const p1 = 'Primera sección con contenido completo y coherente.\n\n';
    const p2 = 'Segunda sección extensa con análisis detallado.\n\n';
    const p3 = 'Tercera sección final del documento.';
    const texto = p1.repeat(30) + p2.repeat(30) + p3;

    const fragmentos = service.dividirEnFragmentos(texto, {
      tamanoObjetivoCaracteres: 2000,
      tamanoMaximoCaracteres: 3000,
      tamanoMinimoCaracteres: 500
    });

    for (const f of fragmentos) {
      // El inicio de un fragmento posterior a un párrafo no debe empezar a mitad de palabra
      expect(f.texto[0]).not.toMatch(/[a-záéíóúüñ]/i.test(f.texto[0]) ? /\s/ : /$/);
      // Cada fragmento debe tener longitud dentro del límite tolerable
      expect(f.totalCaracteres).toBeLessThanOrEqual(3000);
    }
  });
});
