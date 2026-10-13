export interface SegmentoOracion {
  texto: string;
  inicio: number;
  fin: number;
}

export interface SegmentoParrafo {
  indice?: number;
  texto: string;
  inicio: number;
  fin: number;
  oraciones: SegmentoOracion[];
}

/**
 * Contrato para el segmentador de texto en oraciones y párrafos preservando offsets exactos.
 */
export interface SegmentadorTexto {
  segmentarOraciones(texto: string): SegmentoOracion[];
  segmentarParrafos(texto: string): SegmentoParrafo[];
}
