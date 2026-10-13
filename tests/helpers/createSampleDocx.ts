import JSZip from 'jszip';

export async function createSampleDocx(parrafos: string[] = [
  'Este es el primer párrafo de prueba extraído del documento Word.',
  'Este es el segundo párrafo estructurado para análisis de IA.'
]): Promise<Uint8Array> {
  const zip = new JSZip();

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const xmlParrafos = parrafos
    .map((p) => `<w:p><w:r><w:t>${p}</w:t></w:r></w:p>`)
    .join('');

  const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>${xmlParrafos}</w:body>
</w:document>`;

  zip.file('[Content_Types].xml', contentTypes);
  zip.folder('_rels')?.file('.rels', rels);
  zip.folder('word')?.file('document.xml', docXml);

  return await zip.generateAsync({ type: 'uint8array' });
}
