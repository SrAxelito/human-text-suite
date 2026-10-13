import { ModoHumanizacion } from '../../domain/enums/ModoHumanizacion';
import { Dictionaries } from './Dictionaries';

export class VocabularyReplacer {
  /**
   * Reemplaza conectores predecibles y léxico hiper-formal según el nivel de agresividad seleccionado.
   */
  public static reemplazarVocabulario(
    texto: string,
    modo: ModoHumanizacion = ModoHumanizacion.EQUILIBRADO
  ): {
    textoTransformado: string;
    transformaciones: string[];
  } {
    if (!texto || texto.trim().length === 0) {
      return { textoTransformado: texto, transformaciones: [] };
    }

    let resultado = texto;
    const transformaciones: string[] = [];
    let contadorSemilla = 1;

    // 1. Reemplazo de conectores clichés
    for (const regla of Dictionaries.REEMPLAZOS_CONECTORES) {
      let opciones: string[];
      switch (modo) {
        case ModoHumanizacion.LIGERO:
          opciones = regla.ligero;
          break;
        case ModoHumanizacion.PROFUNDO:
          opciones = regla.profundo;
          break;
        case ModoHumanizacion.EQUILIBRADO:
        default:
          opciones = regla.equilibrado;
          break;
      }

      resultado = resultado.replace(regla.patron, (coincidencia) => {
        const sustituto = Dictionaries.seleccionarOpcion(opciones, contadorSemilla++);
        const esMayuscula = coincidencia[0] === coincidencia[0].toUpperCase();
        const reemplazoFinal = esMayuscula
          ? sustituto.charAt(0).toUpperCase() + sustituto.slice(1)
          : sustituto;

        transformaciones.push(`Reemplazo de conector: "${coincidencia}" ➔ "${reemplazoFinal}"`);
        return reemplazoFinal;
      });
    }

    // 2. Reemplazo de muletillas léxicas hiper-formales
    for (const regla of Dictionaries.REEMPLAZOS_LEXICOS) {
      resultado = resultado.replace(regla.patron, (coincidencia) => {
        // En modo ligero solo se reemplaza si la semilla es par para no sobre-intervenir
        if (modo === ModoHumanizacion.LIGERO && contadorSemilla % 2 !== 0) {
          contadorSemilla++;
          return coincidencia;
        }

        const sustituto = Dictionaries.seleccionarOpcion(regla.alternativas, contadorSemilla++);
        const esMayuscula = coincidencia[0] === coincidencia[0].toUpperCase();
        const reemplazoFinal = esMayuscula
          ? sustituto.charAt(0).toUpperCase() + sustituto.slice(1)
          : sustituto;

        transformaciones.push(`Suavizado léxico: "${coincidencia}" ➔ "${reemplazoFinal}"`);
        return reemplazoFinal;
      });
    }

    return {
      textoTransformado: resultado,
      transformaciones
    };
  }
}
