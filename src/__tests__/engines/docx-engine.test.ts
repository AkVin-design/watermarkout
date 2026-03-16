import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { processDocx } from '@/engines/docx-engine';

async function makeDocxFile(headers: Record<string, string> = {}, docXml?: string): Promise<File> {
  const zip = new JSZip();
  zip.file('[Content_Types].xml', '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"></Types>');
  zip.file('word/document.xml', docXml ?? '<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Hello</w:t></w:r></w:p></w:body></w:document>');

  for (const [name, content] of Object.entries(headers)) {
    zip.file(name, content);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  return new File([blob], 'test.docx', {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

describe('DOCX engine', () => {
  it('processes a clean DOCX without errors', async () => {
    const file = await makeDocxFile();
    const result = await processDocx(file);
    expect(result.watermarksFound).toBe(0);
    expect(result.blob.size).toBeGreaterThan(0);
    expect(result.fileName).toBe('test-cleaned.docx');
  });

  it('removes VML watermarks from headers', async () => {
    const headerXml = `<?xml version="1.0"?>
      <w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
             xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006">
        <w:p>
          <w:pict><v:shape style="position:absolute">WATERMARK</v:shape></w:pict>
        </w:p>
      </w:hdr>`;
    const file = await makeDocxFile({ 'word/header1.xml': headerXml });
    const result = await processDocx(file);
    expect(result.watermarksFound).toBeGreaterThan(0);
  });

  it('removes AlternateContent watermarks', async () => {
    const headerXml = `<?xml version="1.0"?>
      <w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
             xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006">
        <w:p>
          <mc:AlternateContent><mc:Choice><w:drawing>watermark</w:drawing></mc:Choice></mc:AlternateContent>
        </w:p>
      </w:hdr>`;
    const file = await makeDocxFile({ 'word/header1.xml': headerXml });
    const result = await processDocx(file);
    expect(result.watermarksFound).toBeGreaterThan(0);
  });

  it('removes background from document.xml', async () => {
    const docXml = `<?xml version="1.0"?>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:background w:color="FFFF00"/>
        <w:body><w:p><w:r><w:t>Hello</w:t></w:r></w:p></w:body>
      </w:document>`;
    const file = await makeDocxFile({}, docXml);
    const result = await processDocx(file);
    expect(result.watermarksFound).toBe(1);
  });

  it('reports progress callbacks', async () => {
    const file = await makeDocxFile();
    const stages: string[] = [];
    await processDocx(file, (p) => stages.push(p.stage));
    expect(stages).toContain('loading');
    expect(stages).toContain('done');
  });

  it('processes multiple headers', async () => {
    const headerXml = (text: string) => `<?xml version="1.0"?>
      <w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:p><w:pict>${text}</w:pict></w:p>
      </w:hdr>`;
    const file = await makeDocxFile({
      'word/header1.xml': headerXml('WM1'),
      'word/header2.xml': headerXml('WM2'),
    });
    const result = await processDocx(file);
    expect(result.watermarksFound).toBe(2);
  });
});
