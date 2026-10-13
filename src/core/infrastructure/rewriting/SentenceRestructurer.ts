import { ModoHumanizacion } from '../../domain/enums/ModoHumanizacion';
import { SentenceSplitter } from '../nlp/SentenceSplitter';
import { Tokenizer } from '../nlp/Tokenizer';

export class SentenceRestructurer {
  private static splitter = new SentenceSplitter();

  /**
   * Reestructura la sintaxis de las oraciones para quebrar patrones uniformes y formulaicos.
   */
  public static reestructurarSintaxis(
    texto: string,
    modo: ModoHumanizacion = ModoHumanizacion.EQUILIBRADO
  ): {
    textoReestructurado: string;
    transformaciones: string[];
  } {
    if (!texto || texto.trim().length === 0) {
      return { textoReestructurado: texto, transformaciones: [] };
    }

    let resultado = texto;
    const transformaciones: string[] = [];

    // 1. Desarticular estructuras antitéticas y formulaicas
    // "No solo X sino también Y"
    const regexNoSolo = /no solo\s+([^,]+?),\s*sino tambi[eé]n\s+([^.]+?\.)/gi;
    if (regexNoSolo.test(resultado)) {
      resultado = resultado.replace(regexNoSolo, (_, p1, p2) => {
        transformaciones.push('Reorganización de estructura rígida: "No solo... sino también" ➔ Transición orgánica');
        if (modo === ModoHumanizacion.PROFUNDO) {
          return `Más allá de ${p1.trim()}, está el hecho de que ${p2.trim()}`;
        }
        return `Aparte de ${p1.trim()}, ${p2.trim()}`;
      });
    }

    // "Por un lado X... por otro lado Y"
    const regexPorUnLado = /por un lado\s*,?\s*([^;.]+?)\s*(?:;|\.)\s*por otro lado\s*,?\s*([^.]+?\.)/gi;
    if (regexPorUnLado.test(resultado)) {
      resultado = resultado.replace(regexPorUnLado, (_, p1, p2) => {
        transformaciones.push('Reorganización de paralelismo binario: "Por un lado / Por otro lado"');
        return `De una parte, ${p1.trim()}. Al mismo tiempo, ${p2.trim()}`;
      });
    }

    // En modo LIGERO no alteramos la longitud de las oraciones
    if (modo === ModoHumanizacion.LIGERO) {
      return { textoReestructurado: resultado, transformaciones };
    }

    // 2. Ruptura de oraciones monotonamente largas en oraciones asimétricas
    const oraciones = SentenceRestructurer.splitter.segmentarOraciones(resultado);
    if (oraciones.length >= 2) {
      const oracionesNuevas: string[] = [];

      for (let i = 0; i < oraciones.length; i++) {
        const oracionTexto = oraciones[i].texto;
        const palabras = Tokenizer.tokenizarPalabras(oracionTexto);

        // Si la oración es excesivamente larga (> 22 palabras) y tiene conectores internos divisibles
        if (palabras.length >= 22) {
          // Intentar división en nexos de subordinación comunes
          const regexDivisoria = /,\s*(?:lo que permite|lo cual|permitiendo as[ií]|mientras que|con el fin de)\s+/i;
          const match = oracionTexto.match(regexDivisoria);

          if (match && match.index !== undefined) {
            const idx = match.index;
            const primeraParte = oracionTexto.slice(0, idx).trim();
            const conectorOriginal = match[0].trim();
            const segundaParte = oracionTexto.slice(idx + match[0].length).trim();

            let nuevaSegunda = segundaParte;
            if (nuevaSegunda.length > 0) {
              nuevaSegunda = nuevaSegunda.charAt(0).toUpperCase() + nuevaSegunda.slice(1);
            }

            const punto1 = primeraParte.endsWith('.') ? primeraParte : `${primeraParte}.`;
            const punto2 = nuevaSegunda.endsWith('.') ? nuevaSegunda : `${nuevaSegunda}.`;

            oracionesNuevas.push(punto1);
            oracionesNuevas.push(`Esto ${conectorOriginal.replace(/^,\s*/, '').toLowerCase()} ${punto2}`);

            transformaciones.push(
              `Fragmentación de oración monótona (${palabras.length} palabras) en dos frases con ritmo asimétrico`
            );
            continue;
          }
        }

        oracionesNuevas.push(oracionTexto);
      }

      resultado = oracionesNuevas.join(' ');
    }

    return {
      textoReestructurado: resultado,
      transformaciones
    };
  }
}
