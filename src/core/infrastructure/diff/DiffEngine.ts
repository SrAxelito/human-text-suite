import { diffWordsWithSpace, Change } from 'diff';
import { DiferenciaTexto, FragmentoDiferencia } from '../../domain/entities/DiferenciaTexto';

export class DiffEngine {
  /**
   * Genera el desglose comparativo palabra por palabra entre el texto original y el texto humanizado.
   */
  public static calcularDiferencias(textoOriginal: string, textoHumanizado: string): DiferenciaTexto {
    if (!textoOriginal && !textoHumanizado) {
      return {
        fragmentos: [],
        palabrasAgregadas: 0,
        palabrasEliminadas: 0,
        palabrasSinCambio: 0,
        porcentajeSimilitud: 100
      };
    }

    const cambios: Change[] = diffWordsWithSpace(textoOriginal || '', textoHumanizado || '');
    const fragmentos: FragmentoDiferencia[] = [];

    let palabrasAgregadas = 0;
    let palabrasEliminadas = 0;
    let palabrasSinCambio = 0;

    for (const cambio of cambios) {
      const palabrasEnCambio = (cambio.value.match(/\S+/g) || []).length;

      let tipo: 'igual' | 'agregado' | 'eliminado' = 'igual';
      if (cambio.added) {
        tipo = 'agregado';
        palabrasAgregadas += palabrasEnCambio;
      } else if (cambio.removed) {
        tipo = 'eliminado';
        palabrasEliminadas += palabrasEnCambio;
      } else {
        palabrasSinCambio += palabrasEnCambio;
      }

      fragmentos.push({
        tipo,
        valor: cambio.value,
        conteo: palabrasEnCambio
      });
    }

    const totalPalabrasEvaluadas = palabrasSinCambio + Math.max(palabrasAgregadas, palabrasEliminadas);
    const porcentajeSimilitud = totalPalabrasEvaluadas > 0
      ? Math.round((palabrasSinCambio / totalPalabrasEvaluadas) * 100)
      : 100;

    return {
      fragmentos,
      palabrasAgregadas,
      palabrasEliminadas,
      palabrasSinCambio,
      porcentajeSimilitud
    };
  }
}
