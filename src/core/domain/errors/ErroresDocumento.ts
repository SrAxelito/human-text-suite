import { ErrorDominioTexto } from './ErroresDominio';

export class ErrorFormatoInvalido extends ErrorDominioTexto {
  constructor(mensaje = 'El archivo debe ser un documento de Microsoft Word válido con extensión .docx') {
    super(mensaje, 'FORMATO_INVALIDO');
  }
}

export class ErrorTamanoExcedido extends ErrorDominioTexto {
  constructor(tamanoBytes: number, limiteBytes = 15 * 1024 * 1024) {
    const tamanoMb = (tamanoBytes / (1024 * 1024)).toFixed(2);
    const limiteMb = (limiteBytes / (1024 * 1024)).toFixed(0);
    super(
      `El archivo (${tamanoMb} MB) supera el límite máximo permitido de ${limiteMb} MB.`,
      'TAMANO_EXCEDIDO'
    );
  }
}

export class ErrorArchivoDanado extends ErrorDominioTexto {
  constructor(mensaje = 'El archivo .docx está dañado o no tiene un formato válido de OpenXML.') {
    super(mensaje, 'ARCHIVO_DANADO');
  }
}

export class ErrorArchivoProtegido extends ErrorDominioTexto {
  constructor(mensaje = 'El documento .docx está protegido con contraseña o cifrado.') {
    super(mensaje, 'ARCHIVO_PROTEGIDO');
  }
}
