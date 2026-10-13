import { describe, it, expect } from 'vitest';
import { DocumentReaderService } from '../../src/core/services/DocumentReaderService';
import {
  ErrorFormatoInvalido,
  ErrorTamanoExcedido,
  ErrorArchivoDanado,
  ErrorTextoVacio
} from '../../src/core/domain';
import { createSampleDocx } from '../helpers/createSampleDocx';

describe('DocumentReaderService - Extracción y Lectura de Archivos Word (.docx)', () => {
  const service = new DocumentReaderService();

  it('debe extraer fielmente los párrafos conservando la coherencia estructural', async () => {
    const parrafosEsperados = [
      'Este es el primer párrafo de prueba extraído del documento Word.',
      'Este es el segundo párrafo estructurado para análisis de IA.'
    ];

    const bytesDocx = await createSampleDocx(parrafosEsperados);
    const resultado = await service.leerDocumento(bytesDocx, 'ensayo_tecnico.docx');

    expect(resultado).toBeDefined();
    expect(resultado.texto).toContain(parrafosEsperados[0]);
    expect(resultado.texto).toContain(parrafosEsperados[1]);
    expect(resultado.metadatos.nombre).toBe('ensayo_tecnico.docx');
    expect(resultado.metadatos.totalParrafos).toBe(2);
    expect(resultado.metadatos.totalPalabras).toBeGreaterThan(15);
    expect(resultado.metadatos.tamanoBytes).toBe(bytesDocx.byteLength);
  });

  it('debe sanitizar caracteres invisibles, saltos de línea excesivos y espacios redundantes', () => {
    const sucio = 'Párrafo uno\u00A0con espacios duros y\uFEFFinvisibles.   \r\n\r\n\r\n\r\nPárrafo dos.\t\t';
    const limpio = service.sanitizarTexto(sucio);

    expect(limpio).not.toContain('\uFEFF');
    expect(limpio).not.toContain('\u00A0');
    expect(limpio).not.toContain('\r');
    expect(limpio).toContain('Párrafo uno con espacios duros yinvisibles.\n\nPárrafo dos.');
  });

  it('debe rechazar extensiones que no sean .docx con ErrorFormatoInvalido', async () => {
    const bytes = new Uint8Array([0x50, 0x4B, 0x03, 0x04, 0x00]);
    await expect(service.leerDocumento(bytes, 'documento.pdf')).rejects.toThrow(ErrorFormatoInvalido);
    await expect(service.leerDocumento(bytes, 'archivo.txt')).rejects.toThrow(ErrorFormatoInvalido);
    await expect(service.leerDocumento(bytes, 'imagen.docx.png')).rejects.toThrow(ErrorFormatoInvalido);
  });

  it('debe rechazar archivos que no tengan la firma ZIP de OpenXML', async () => {
    const archivoFalso = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04]);
    await expect(service.leerDocumento(archivoFalso, 'corrupto.docx')).rejects.toThrow(ErrorFormatoInvalido);
  });

  it('debe rechazar archivos que superen el límite de tamaño configurado (15 MB)', async () => {
    const servicioEstricto = new DocumentReaderService(1024); // 1 KB de límite
    const bytesDocx = await createSampleDocx(['Párrafo normal de prueba.']);

    // bytesDocx mide ~1.5 - 2 KB
    await expect(servicioEstricto.leerDocumento(bytesDocx, 'grande.docx')).rejects.toThrow(ErrorTamanoExcedido);
  });

  it('debe rechazar archivos de 0 bytes con ErrorArchivoDanado', async () => {
    const vacio = new Uint8Array(0);
    await expect(service.leerDocumento(vacio, 'vacio.docx')).rejects.toThrow(ErrorArchivoDanado);
  });

  it('debe rechazar documentos docx sin contenido de texto con ErrorTextoVacio', async () => {
    const bytesDocxVacio = await createSampleDocx(['', '   ']);
    await expect(service.leerDocumento(bytesDocxVacio, 'sin_texto.docx')).rejects.toThrow(ErrorTextoVacio);
  });

  it('debe funcionar correctamente cuando se pasa un objeto File del navegador', async () => {
    const bytesDocx = await createSampleDocx(['Texto dentro de File object.']);
    const file = new File([bytesDocx], 'tesis.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    const resultado = await service.leerDocumento(file);
    expect(resultado.texto).toContain('Texto dentro de File object.');
    expect(resultado.metadatos.nombre).toBe('tesis.docx');
  });
});
