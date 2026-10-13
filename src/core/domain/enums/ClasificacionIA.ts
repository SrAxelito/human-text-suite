/**
 * Clasificación probabilística del origen del texto analizado.
 */
export enum ClasificacionIA {
  ALTAMENTE_PROBABLE_IA = 'ALTAMENTE_PROBABLE_IA',
  MIXTO_DUDOSO = 'MIXTO_DUDOSO',
  PROBABLEMENTE_HUMANO = 'PROBABLEMENTE_HUMANO'
}

export function clasificarProbabilidad(probabilidadIA: number): ClasificacionIA {
  if (probabilidadIA >= 70) {
    return ClasificacionIA.ALTAMENTE_PROBABLE_IA;
  }
  if (probabilidadIA >= 35) {
    return ClasificacionIA.MIXTO_DUDOSO;
  }
  return ClasificacionIA.PROBABLEMENTE_HUMANO;
}

export function obtenerEtiquetaClasificacion(clasificacion: ClasificacionIA): string {
  switch (clasificacion) {
    case ClasificacionIA.ALTAMENTE_PROBABLE_IA:
      return 'Altamente probable de IA';
    case ClasificacionIA.MIXTO_DUDOSO:
      return 'Mixto / Dudoso';
    case ClasificacionIA.PROBABLEMENTE_HUMANO:
      return 'Probablemente humano';
  }
}
