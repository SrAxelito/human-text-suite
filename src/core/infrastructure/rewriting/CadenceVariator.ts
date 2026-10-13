import { ModoHumanizacion } from '../../domain/enums/ModoHumanizacion';
import { SentenceSplitter } from '../nlp/SentenceSplitter';

export class CadenceVariator {
  private static splitter = new SentenceSplitter();

  // Transiciones y pausas discursivas orgánicas breves
  private static readonly INCISOS_ORGANICOS = [
    'Visto con perspectiva,',
    'Y no es para menos:',
    'Dicho con franqueza,',
    'Mirándolo de cerca,',
    'Conviene recordarlo:'
  ];

  /**
   * Modula la cadencia discursiva para enriquecer la varianza de longitud (Burstiness).
   */
  public static modularCadencia(
    texto: string,
    modo: ModoHumanizacion = ModoHumanizacion.EQUILIBRADO
  ): {
    textoModulado: string;
    transformaciones: string[];
  } {
    if (!texto || texto.trim().length === 0 || modo === ModoHumanizacion.LIGERO) {
      return { textoModulado: texto, transformaciones: [] };
    }

    const oraciones = CadenceVariator.splitter.segmentarOraciones(texto);
    if (oraciones.length < 3) {
      return { textoModulado: texto, transformaciones: [] };
    }

    const transformaciones: string[] = [];
    const resultado: string[] = [];

    for (let i = 0; i < oraciones.length; i++) {
      let textoOracion = oraciones[i].texto;

      // En modo PROFUNDO, insertamos una transición conversacional sutil a mitad del texto
      if (modo === ModoHumanizacion.PROFUNDO && i === 1 && oraciones.length >= 4) {
        const inciso = CadenceVariator.INCISOS_ORGANICOS[0];
        // Si no empieza ya con un conector fuerte
        if (!/^(sin embargo|pero|por|en|además)/i.test(textoOracion)) {
          textoOracion = `${inciso} ${textoOracion.charAt(0).toLowerCase() + textoOracion.slice(1)}`;
          transformaciones.push(`Inyección de cadencia conversacional: "${inciso}"`);
        }
      }

      resultado.push(textoOracion);
    }

    return {
      textoModulado: resultado.join(' '),
      transformaciones
    };
  }
}
