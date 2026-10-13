import { SegmentadorTexto, SegmentoOracion, SegmentoParrafo } from '../../domain/interfaces/SegmentadorTexto';

export class SentenceSplitter implements SegmentadorTexto {
  // Prefijos y títulos honoríficos que nunca terminan una oración
  private static readonly PREFIJOS_HONORIFICOS = new Set([
    'dr', 'dra', 'sr', 'sra', 'srta', 'prof', 'ing', 'lic',
    'mr', 'mrs', 'ms', 'vol', 'cap', 'art', 'num', 'núm', 'pág', 'pag'
  ]);

  // Abreviaturas comunes que solo continúan si la siguiente palabra empieza en minúscula
  private static readonly OTRAS_ABREVIATURAS = new Set([
    'etc', 'ej', 'vs', 'inc', 'corp', 'cia', 'tel', 'aprox'
  ]);

  public segmentarOraciones(texto: string): SegmentoOracion[] {
    if (!texto || texto.trim().length === 0) return [];

    const resultado: SegmentoOracion[] = [];
    const longitud = texto.length;
    let inicioActual = 0;

    // Saltarse espacios iniciales
    while (inicioActual < longitud && /\s/.test(texto[inicioActual])) {
      inicioActual++;
    }

    let i = inicioActual;

    while (i < longitud) {
      const char = texto[i];

      // Puntos de terminación de oración comunes
      if (char === '.' || char === '!' || char === '?' || char === '…') {
        const esPuntosSuspensivos = char === '…' || (char === '.' && i + 1 < longitud && texto[i + 1] === '.');

        // Avanzar por puntos consecutivos si son suspensivos (...)
        while (i + 1 < longitud && (texto[i + 1] === '.' || texto[i + 1] === '…')) {
          i++;
        }

        const palabraPrevia = this.extraerPalabraPrevia(texto, i);
        const palabraPreviaMin = palabraPrevia ? palabraPrevia.toLowerCase() : '';

        // 1. Títulos honoríficos (Dr., Prof.) nunca cierran oración
        if (SentenceSplitter.PREFIJOS_HONORIFICOS.has(palabraPreviaMin)) {
          i++;
          continue;
        }

        // 2. Números decimales (ej. "3.14")
        if (char === '.' && i > 0 && i + 1 < longitud && /\d/.test(texto[i - 1]) && /\d/.test(texto[i + 1])) {
          i++;
          continue;
        }

        // Buscar siguiente carácter no blanco para verificar si continúa con minúscula
        let fin = i + 1;
        while (fin < longitud && /['"»\)\]\}]/.test(texto[fin])) {
          fin++;
        }

        let sigNoBlanco = fin;
        while (sigNoBlanco < longitud && /\s/.test(texto[sigNoBlanco])) {
          sigNoBlanco++;
        }

        // Si son puntos suspensivos o abreviaturas secundarias y la siguiente letra es minúscula, continúa la oración
        if (sigNoBlanco < longitud) {
          const sigChar = texto[sigNoBlanco];
          const esMinuscula = sigChar === sigChar.toLowerCase() && sigChar !== sigChar.toUpperCase();

          if (esPuntosSuspensivos && esMinuscula) {
            i++;
            continue;
          }

          if (SentenceSplitter.OTRAS_ABREVIATURAS.has(palabraPreviaMin) && esMinuscula) {
            i++;
            continue;
          }
        }

        // Validar si el siguiente carácter indica un nuevo inicio de oración o fin de texto
        if (fin >= longitud || /\s/.test(texto[fin])) {
          const textoOracion = texto.slice(inicioActual, fin).trim();
          if (textoOracion.length > 0) {
            resultado.push({
              texto: textoOracion,
              inicio: inicioActual,
              fin
            });
          }

          inicioActual = fin;
          while (inicioActual < longitud && /\s/.test(texto[inicioActual])) {
            inicioActual++;
          }
          i = inicioActual;
          continue;
        }
      }

      i++;
    }

    if (inicioActual < longitud) {
      const textoRemanente = texto.slice(inicioActual).trim();
      if (textoRemanente.length > 0) {
        resultado.push({
          texto: textoRemanente,
          inicio: inicioActual,
          fin: longitud
        });
      }
    }

    return resultado;
  }

  public segmentarParrafos(texto: string): SegmentoParrafo[] {
    if (!texto || texto.trim().length === 0) return [];

    const parrafos: SegmentoParrafo[] = [];
    const bloques = texto.split(/\n\s*\n/);
    let offset = 0;

    for (let pIdx = 0; pIdx < bloques.length; pIdx++) {
      const bloque = bloques[pIdx];
      const inicioBloque = texto.indexOf(bloque, offset);
      offset = inicioBloque + bloque.length;

      const textoLimpio = bloque.trim();
      if (textoLimpio.length === 0) continue;

      const inicio = texto.indexOf(textoLimpio, inicioBloque);
      const fin = inicio + textoLimpio.length;
      const oraciones = this.segmentarOraciones(textoLimpio).map((o) => ({
        texto: o.texto,
        inicio: inicio + o.inicio,
        fin: inicio + o.fin
      }));

      parrafos.push({
        indice: pIdx,
        texto: textoLimpio,
        inicio,
        fin,
        oraciones
      });
    }

    return parrafos;
  }

  private extraerPalabraPrevia(texto: string, indicePunto: number): string | null {
    let k = indicePunto - 1;
    while (k >= 0 && /[a-záéíóúüñA-ZÁÉÍÓÚÜÑ]/i.test(texto[k])) {
      k--;
    }
    const palabra = texto.slice(k + 1, indicePunto);
    return palabra.length > 0 ? palabra : null;
  }
}
