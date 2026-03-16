import JSZip from 'jszip';
import { generateFileName } from './utils';
import type { ProcessingResult, ProgressCallback } from './types';

// Patterns for watermark elements in DOCX XML
const WATERMARK_PATTERNS = [
  // VML shapes (Word 2003 and later watermarks)
  /<w:pict>[\s\S]*?<\/w:pict>/gi,
  // DrawingML alternate content (modern watermarks)
  /<mc:AlternateContent>[\s\S]*?<\/mc:AlternateContent>/gi,
  // Drawing elements with behindDoc (background watermarks)
  /<w:drawing>[\s\S]*?behindDoc[\s\S]*?<\/w:drawing>/gi,
];

// Background pattern for document.xml
const BACKGROUND_PATTERN = /<w:background[\s\S]*?\/>/gi;
const BACKGROUND_BLOCK_PATTERN = /<w:background[\s\S]*?<\/w:background>/gi;

function cleanHeaderXml(xml: string): { cleaned: string; removed: number } {
  let removed = 0;
  let cleaned = xml;

  for (const pattern of WATERMARK_PATTERNS) {
    cleaned = cleaned.replace(pattern, () => {
      removed++;
      return '';
    });
  }

  return { cleaned, removed };
}

function cleanDocumentXml(xml: string): { cleaned: string; removed: number } {
  let removed = 0;
  let cleaned = xml;

  cleaned = cleaned.replace(BACKGROUND_PATTERN, () => {
    removed++;
    return '';
  });
  cleaned = cleaned.replace(BACKGROUND_BLOCK_PATTERN, () => {
    removed++;
    return '';
  });

  return { cleaned, removed };
}

function cleanRelsXml(xml: string, removedImageIds: Set<string>): string {
  if (removedImageIds.size === 0) return xml;

  // Remove relationship entries for orphaned images
  for (const id of removedImageIds) {
    const relPattern = new RegExp(
      `<Relationship[^>]*Id="${id}"[^>]*\\/?>`,
      'gi'
    );
    xml = xml.replace(relPattern, '');
  }

  return xml;
}

export async function processDocx(
  file: File,
  onProgress?: ProgressCallback
): Promise<ProcessingResult> {
  const startTime = performance.now();

  onProgress?.({ stage: 'loading', percent: 10, message: 'Loading DOCX...' });

  const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
  const zip = await JSZip.loadAsync(buffer);
  let watermarksRemoved = 0;

  onProgress?.({ stage: 'analyzing', percent: 20, message: 'Analyzing document structure...' });

  // Process header files
  const headerFiles = Object.keys(zip.files).filter(
    (name) => name.match(/^word\/header\d*\.xml$/)
  );

  const orphanedImageIds = new Set<string>();

  for (const headerPath of headerFiles) {
    onProgress?.({
      stage: 'removing',
      percent: 30,
      message: `Cleaning ${headerPath}...`,
    });

    const xml = await zip.file(headerPath)!.async('string');

    // Extract image relationship IDs before cleaning (to orphan-clean rels later)
    const embedMatches = xml.matchAll(/r:embed="(rId\d+)"/gi);
    const beforeIds = new Set([...embedMatches].map((m) => m[1]));

    const result = cleanHeaderXml(xml);
    watermarksRemoved += result.removed;

    if (result.removed > 0) {
      zip.file(headerPath, result.cleaned);

      // Find IDs that are no longer referenced
      const afterEmbedMatches = result.cleaned.matchAll(/r:embed="(rId\d+)"/gi);
      const afterIds = new Set([...afterEmbedMatches].map((m) => m[1]));
      for (const id of beforeIds) {
        if (!afterIds.has(id)) orphanedImageIds.add(id);
      }

      // Clean corresponding rels file
      const relsPath = `word/_rels/${headerPath.split('/').pop()}.rels`;
      if (zip.files[relsPath]) {
        const relsXml = await zip.file(relsPath)!.async('string');
        const cleanedRels = cleanRelsXml(relsXml, orphanedImageIds);
        zip.file(relsPath, cleanedRels);
      }
    }
  }

  // Process document.xml for background watermarks
  onProgress?.({ stage: 'removing', percent: 60, message: 'Checking document background...' });

  const docPath = 'word/document.xml';
  if (zip.files[docPath]) {
    const docXml = await zip.file(docPath)!.async('string');
    const result = cleanDocumentXml(docXml);
    watermarksRemoved += result.removed;
    if (result.removed > 0) {
      zip.file(docPath, result.cleaned);
    }
  }

  onProgress?.({ stage: 'rebuilding', percent: 80, message: 'Rebuilding document...' });

  const outputBlob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  onProgress?.({ stage: 'done', percent: 100, message: 'Done!' });

  return {
    blob: outputBlob,
    fileName: generateFileName(file.name),
    originalSize: file.size,
    processedSize: outputBlob.size,
    watermarksFound: watermarksRemoved,
    strategy: 'xml-strip',
    duration: performance.now() - startTime,
  };
}
