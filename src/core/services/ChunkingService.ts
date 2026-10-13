import {
  SegmentadorChunking,
  FragmentoTexto,
  OpcionesChunking
} from '../domain/interfaces/SegmentadorChunking';
import { Tokenizer } from '../infrastructure/nlp/Tokenizer';

export class ChunkingService implements SegmentadorChunking {
  public static readonly TAMANO_OBJETIVO_DEFECTO = 12000; // ~2.500 palabras
  public static readonly TAMANO_MAXIMO_DEFECTO = 15000;
  public static readonly TAMANO_MINIMO_DEFECTO = 2500;

  /**
   * Divide un texto extenso en fragmentos contiguos respetando límites semánticos
   * (párrafos, encabezados y oraciones) sin cortar palabras ni perder caracteres.
   */
  public dividirEnFragmentos(
    texto: string,
    opciones?: OpcionesChunking
  ): FragmentoTexto[] {
    if (!texto || texto.length === 0) return [];

    const tamanoObjetivo = opciones?.tamanoObjetivoCaracteres || ChunkingService.TAMANO_OBJETIVO_DEFECTO;
    const tamanoMaximo = opciones?.tamanoMaximoCaracteres || ChunkingService.TAMANO_MAXIMO_DEFECTO;
    const tamanoMinimo = opciones?.tamanoMinimoCaracteres || ChunkingService.TAMANO_MINIMO_DEFECTO;

    const longitudTotal = texto.length;

    // Si el texto completo es menor o igual al tamaño máximo, no requiere división
    if (longitudTotal <= tamanoMaximo) {
      return [
        {
          indice: 0,
          texto,
          inicio: 0,
          fin: longitudTotal,
          totalCaracteres: longitudTotal,
          totalPalabras: Tokenizer.tokenizarPalabras(texto).length
        }
      ];
    }

    const fragmentos: FragmentoTexto[] = [];
    let inicioActual = 0;
    let indiceBloque = 0;

    while (inicioActual < longitudTotal) {
      const remanente = longitudTotal - inicioActual;

      // Si lo que queda cabe cómodamente en el último bloque
      if (remanente <= tamanoMaximo) {
        const textoBloque = texto.slice(inicioActual);
        fragmentos.push({
          indice: indiceBloque++,
          texto: textoBloque,
          inicio: inicioActual,
          fin: longitudTotal,
          totalCaracteres: textoBloque.length,
          totalPalabras: Tokenizer.tokenizarPalabras(textoBloque).length
        });
        break;
      }

      // Buscar el mejor punto de corte semántico en la ventana permitida
      const limiteInferior = inicioActual + Math.min(tamanoMinimo, remanente);
      const limiteSuperior = inicioActual + Math.min(tamanoMaximo, remanente);
      const objetivo = inicioActual + tamanoObjetivo;

      const puntoCorte = this.encontrarCorteSemantico(
        texto,
        limiteInferior,
        limiteSuperior,
        objetivo
      );

      const textoBloque = texto.slice(inicioActual, puntoCorte);
      fragmentos.push({
        indice: indiceBloque++,
        texto: textoBloque,
        inicio: inicioActual,
        fin: puntoCorte,
        totalCaracteres: textoBloque.length,
        totalPalabras: Tokenizer.tokenizarPalabras(textoBloque).length
      });

      inicioActual = puntoCorte;
    }

    return fragmentos;
  }

  /**
   * Encuentra el corte óptimo priorizando:
   * 1. Doble salto de línea (párrafos \n\n)
   * 2. Salto de línea simple (\n)
   * 3. Fin de oración (. ! ? seguido de espacio)
   * 4. Espacio entre palabras (\s)
   */
  private encontrarCorteSemantico(
    texto: string,
    min: number,
    max: number,
    objetivo: number
  ): number {
    const ventana = texto.slice(min, max);

    // 1. Prioridad: Doble salto de línea (\n\n)
    const corteParrafo = this.buscarPuntoCercanoRegex(
      ventana,
      /\n\s*\n/g,
      min,
      objetivo,
      true // cortar tras los saltos
    );
    if (corteParrafo !== -1) return corteParrafo;

    // 2. Prioridad: Fin de oración (. ! ? seguido de espacio o salto)
    const corteOracion = this.buscarPuntoCercanoRegex(
      ventana,
      /[.!?…]['"»\)\]\}]?\s+/g,
      min,
      objetivo,
      true // cortar tras el espacio posterior al punto
    );
    if (corteOracion !== -1) return corteOracion;

    // 3. Prioridad: Salto de línea simple (\n)
    const corteLinea = this.buscarPuntoCercanoRegex(
      ventana,
      /\n+/g,
      min,
      objetivo,
      true
    );
    if (corteLinea !== -1) return corteLinea;

    // 4. Prioridad: Espacio entre palabras (no cortar palabras por la mitad)
    const corteEspacio = this.buscarPuntoCercanoRegex(
      ventana,
      /\s+/g,
      min,
      objetivo,
      true
    );
    if (corteEspacio !== -1) return corteEspacio;

    // Fallback de emergencia si no hay ningún espacio en la ventana
    return max;
  }

  private buscarPuntoCercanoRegex(
    ventana: string,
    regex: RegExp,
    offsetBase: number,
    objetivoGlobal: number,
    despuesDeCoincidencia: boolean
  ): number {
    let mejorPunto = -1;
    let menorDistancia = Infinity;

    let match: RegExpExecArray | null;
    while ((match = regex.exec(ventana)) !== null) {
      const posicionRelativa = despuesDeCoincidencia
        ? match.index + match[0].length
        : match.index;
      const posicionGlobal = offsetBase + posicionRelativa;
      const distancia = Math.abs(posicionGlobal - objetivoGlobal);

      if (distancia < menorDistancia) {
        menorDistancia = distancia;
        mejorPunto = posicionGlobal;
      }
    }

    return mejorPunto;
  }
}
