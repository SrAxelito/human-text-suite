export interface MetadatosDocumento {
  nombre: string;
  tamanoBytes: number;
  tipoMime: string;
  totalPalabras: number;
  totalParrafos: number;
}

export interface ResultadoLecturaDocumento {
  texto: string;
  metadatos: MetadatosDocumento;
}

export interface LectorDocumentos {
  leerDocumento(
    archivo: File | ArrayBuffer | Uint8Array,
    nombre?: string
  ): Promise<ResultadoLecturaDocumento>;
}
