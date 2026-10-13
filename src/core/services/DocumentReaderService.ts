import mammoth from 'mammoth';
import {
  LectorDocumentos,
  ResultadoLecturaDocumento,
  MetadatosDocumento,
  ErrorFormatoInvalido,
  ErrorTamanoExcedido,
  ErrorArchivoDanado,
  ErrorArchivoProtegido,
  ErrorTextoVacio
} from '../domain';

export class DocumentReaderService implements LectorDocumentos {
  public static readonly LIMITE_BYTES_DEFECTO = 15 * 1024 * 1024; // 15 MB
  public static readonly MIMES_VALIDOS = new Set([
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/docx',
    'application/zip',
    'application/x-zip-compressed',
    'application/octet-stream',
    '' // En algunos entornos de Windows, el navegador no asigna tipo MIME
  ]);

  private limiteBytes: number;

  constructor(limiteBytes = DocumentReaderService.LIMITE_BYTES_DEFECTO) {
    this.limiteBytes = limiteBytes;
  }

  /**
   * Lee, valida, extrae y sanitiza el contenido de un archivo .docx.
   */
  public async leerDocumento(
    archivo: File | ArrayBuffer | Uint8Array,
    nombre?: string
  ): Promise<ResultadoLecturaDocumento> {
    const nombreArchivo = this.obtenerNombreArchivo(archivo, nombre);
    const tipoMime = archivo instanceof File ? archivo.type : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const tamanoBytes = this.obtenerTamanoBytes(archivo);

    // 1. Validación de tamaño
    if (tamanoBytes > this.limiteBytes) {
      throw new ErrorTamanoExcedido(tamanoBytes, this.limiteBytes);
    }

    if (tamanoBytes === 0) {
      throw new ErrorArchivoDanado('El archivo seleccionado está completamente vacío (0 bytes).');
    }

    // 2. Validación de extensión
    if (!this.validarExtensionDocx(nombreArchivo)) {
      throw new ErrorFormatoInvalido(
        `El archivo "${nombreArchivo}" no tiene la extensión .docx requerida.`
      );
    }

    // 3. Validación de MIME (si proviene de un File object)
    if (archivo instanceof File && archivo.type && !DocumentReaderService.MIMES_VALIDOS.has(archivo.type.toLowerCase())) {
      throw new ErrorFormatoInvalido(
        `El tipo MIME "${archivo.type}" no corresponde a un documento de Microsoft Word (.docx).`
      );
    }

    // 4. Obtención de ArrayBuffer
    const arrayBuffer = await this.obtenerArrayBuffer(archivo);

    // 5. Validación de firma binaria (Magic Numbers ZIP/PK: 50 4B 03 04 ó 50 4B 05 06)
    this.validarFirmaZip(arrayBuffer);

    // 6. Extracción con Mammoth
    let textoExtraido: string;
    try {
      // Mammoth en Node requiere options.buffer, mientras que en navegador usa options.arrayBuffer
      const inputMammoth: unknown = {
        arrayBuffer,
        buffer: arrayBuffer
      };
      const resultado = await mammoth.extractRawText(inputMammoth as mammoth.MammothOptions);
      textoExtraido = resultado.value;
    } catch (error: unknown) {
      const mensaje = error instanceof Error ? error.message : String(error);
      if (/password|encrypted|cifrad/i.test(mensaje)) {
        throw new ErrorArchivoProtegido();
      }
      throw new ErrorArchivoDanado(`Error al procesar el documento Word: ${mensaje}`);
    }

    // 7. Sanitización del texto extraído
    const textoSanitizado = this.sanitizarTexto(textoExtraido);

    if (!textoSanitizado || textoSanitizado.trim().length === 0) {
      throw new ErrorTextoVacio('El documento .docx no contiene texto legible o párrafos utilizables.');
    }

    // 8. Cálculo de metadatos estructurales
    const totalPalabras = (textoSanitizado.match(/\S+/g) || []).length;
    const parrafos = textoSanitizado.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    const totalParrafos = parrafos.length;

    const metadatos: MetadatosDocumento = {
      nombre: nombreArchivo,
      tamanoBytes,
      tipoMime,
      totalPalabras,
      totalParrafos
    };

    return {
      texto: textoSanitizado,
      metadatos
    };
  }

  /**
   * Sanitiza el texto plano eliminando caracteres invisibles, artefactos XML y normalizando espacios.
   */
  public sanitizarTexto(texto: string): string {
    if (!texto) return '';

    return texto
      // Normalizar saltos de línea Windows/Mac a Unix \n
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Reemplazar espacios de no separación por espacios convencionales
      .replace(/\u00A0/g, ' ')
      // Eliminar caracteres de control invisibles (excepto \n y \t)
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\uFEFF]/g, '')
      // Eliminar posibles etiquetas XML residuales de Word si existieran
      .replace(/<\/?[a-zA-Z0-9_:-]+(?:\s+[^>]*?)?>/g, '')
      // Reemplazar tabulaciones por espacios
      .replace(/\t+/g, ' ')
      // Reducir espacios múltiples consecutivos en la misma línea
      .replace(/[ ]{2,}/g, ' ')
      // Eliminar espacios al inicio y fin de cada línea
      .split('\n')
      .map((linea) => linea.trim())
      .join('\n')
      // Reducir 3 o más saltos de línea a separación estándar de párrafo (\n\n)
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private validarExtensionDocx(nombre: string): boolean {
    return /\.docx$/i.test(nombre);
  }

  private validarFirmaZip(arrayBuffer: ArrayBuffer): void {
    if (arrayBuffer.byteLength < 4) {
      throw new ErrorArchivoDanado('El archivo tiene un tamaño insuficiente para ser un documento .docx válido.');
    }

    const bytes = new Uint8Array(arrayBuffer.slice(0, 4));
    // Firma ZIP común: 0x50, 0x4B (PK), seguido de 0x03 0x04 o 0x05 0x06
    const esFirmaZip = bytes[0] === 0x50 && bytes[1] === 0x4b;
    if (!esFirmaZip) {
      throw new ErrorFormatoInvalido('El archivo no posee la estructura de compresión ZIP característica de OpenXML (.docx).');
    }
  }

  private async obtenerArrayBuffer(archivo: File | ArrayBuffer | Uint8Array): Promise<ArrayBuffer> {
    if (archivo instanceof File) {
      return await archivo.arrayBuffer();
    }
    if (archivo instanceof Uint8Array) {
      return archivo.buffer.slice(archivo.byteOffset, archivo.byteOffset + archivo.byteLength) as ArrayBuffer;
    }
    return archivo as ArrayBuffer;
  }

  private obtenerNombreArchivo(archivo: File | ArrayBuffer | Uint8Array, nombreOpcional?: string): string {
    if (archivo instanceof File) {
      return archivo.name;
    }
    return nombreOpcional || 'documento.docx';
  }

  private obtenerTamanoBytes(archivo: File | ArrayBuffer | Uint8Array): number {
    if (archivo instanceof File) {
      return archivo.size;
    }
    return archivo.byteLength;
  }
}
