import { PDFDocument, PDFName, PDFDict, PDFArray, PDFRef, PDFStream, PDFRawStream, decodePDFRawStream } from 'pdf-lib';
import type { ProgressCallback } from './types';

interface CleanResult {
  pdfDoc: PDFDocument;
  watermarksRemoved: number;
}

function removeWatermarkAnnotations(page: PDFDict, pdfDoc: PDFDocument): number {
  let removed = 0;
  const annots = page.lookup(PDFName.of('Annots'));
  if (!(annots instanceof PDFArray)) return 0;

  const indicesToRemove: number[] = [];
  for (let i = 0; i < annots.size(); i++) {
    const annotRef = annots.get(i);
    const annot = pdfDoc.context.lookup(annotRef);
    if (!(annot instanceof PDFDict)) continue;

    const subtype = annot.get(PDFName.of('Subtype'));
    if (subtype instanceof PDFName && subtype.toString() === '/Stamp') {
      indicesToRemove.push(i);
      continue;
    }

    // Low opacity annotations (< 0.5) are likely watermarks
    const ca = annot.get(PDFName.of('CA'));
    if (ca !== undefined) {
      const val = parseFloat(String(ca));
      if (!isNaN(val) && val < 0.5) {
        indicesToRemove.push(i);
      }
    }
  }

  // Remove in reverse order to preserve indices
  for (let i = indicesToRemove.length - 1; i >= 0; i--) {
    annots.remove(indicesToRemove[i]);
    removed++;
  }

  return removed;
}

function cleanContentStream(streamBytes: Uint8Array): { cleaned: Uint8Array; removed: number } {
  const text = new TextDecoder('latin1').decode(streamBytes);
  let removed = 0;

  // Remove marked content blocks: /Artifact BMC ... EMC and /Watermark BDC ... EMC
  let cleaned = text.replace(/\/Artifact\s+BMC[\s\S]*?EMC/g, () => {
    removed++;
    return '';
  });
  cleaned = cleaned.replace(/\/Watermark\s+BDC[\s\S]*?EMC/g, () => {
    removed++;
    return '';
  });

  // Remove /Watermark marked content with properties
  cleaned = cleaned.replace(/\/OC\s+\/Watermark[\s\S]*?EMC/g, () => {
    removed++;
    return '';
  });

  if (removed === 0) return { cleaned: streamBytes, removed: 0 };
  return { cleaned: new TextEncoder().encode(cleaned), removed };
}

function removeOCGs(pdfDoc: PDFDocument): number {
  let removed = 0;
  const catalog = pdfDoc.catalog;
  const ocProperties = catalog.get(PDFName.of('OCProperties'));
  if (!(ocProperties instanceof PDFDict)) return 0;

  const ocgs = ocProperties.get(PDFName.of('OCGs'));
  if (!(ocgs instanceof PDFArray)) return 0;

  const indicesToRemove: number[] = [];
  for (let i = 0; i < ocgs.size(); i++) {
    const ref = ocgs.get(i);
    const ocg = pdfDoc.context.lookup(ref);
    if (!(ocg instanceof PDFDict)) continue;

    const name = ocg.get(PDFName.of('Name'));
    if (name && String(name).toLowerCase().includes('watermark')) {
      indicesToRemove.push(i);
    }
  }

  for (let i = indicesToRemove.length - 1; i >= 0; i--) {
    ocgs.remove(indicesToRemove[i]);
    removed++;
  }

  return removed;
}

export async function cleanPdfStructural(
  data: Uint8Array,
  onProgress?: ProgressCallback
): Promise<CleanResult> {
  onProgress?.({ stage: 'loading', percent: 10, message: 'Loading PDF...' });

  const pdfDoc = await PDFDocument.load(data, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  let watermarksRemoved = 0;

  onProgress?.({ stage: 'analyzing', percent: 20, message: 'Analyzing PDF structure...' });

  // Remove OCGs named "Watermark"
  watermarksRemoved += removeOCGs(pdfDoc);

  const totalPages = pages.length;
  for (let i = 0; i < totalPages; i++) {
    const page = pages[i];
    const pageDict = page.node;

    onProgress?.({
      stage: 'removing',
      percent: 20 + Math.round((i / totalPages) * 60),
      message: `Processing page ${i + 1} of ${totalPages}...`,
    });

    // Remove watermark annotations
    watermarksRemoved += removeWatermarkAnnotations(pageDict, pdfDoc);

    // Clean content streams
    const contents = pageDict.get(PDFName.of('Contents'));
    if (contents instanceof PDFRef) {
      const stream = pdfDoc.context.lookup(contents);
      if (stream instanceof PDFRawStream) {
        try {
          const decoded = decodePDFRawStream(stream);
          const result = cleanContentStream(decoded.decode());
          if (result.removed > 0) {
            watermarksRemoved += result.removed;
            const newStream = pdfDoc.context.flateStream(result.cleaned);
            pdfDoc.context.assign(contents, newStream);
          }
        } catch {
          // Stream decode failure — skip
        }
      }
    } else if (contents instanceof PDFArray) {
      for (let j = 0; j < contents.size(); j++) {
        const ref = contents.get(j);
        if (!(ref instanceof PDFRef)) continue;
        const stream = pdfDoc.context.lookup(ref);
        if (!(stream instanceof PDFRawStream)) continue;
        try {
          const decoded = decodePDFRawStream(stream);
          const result = cleanContentStream(decoded.decode());
          if (result.removed > 0) {
            watermarksRemoved += result.removed;
            const newStream = pdfDoc.context.flateStream(result.cleaned);
            pdfDoc.context.assign(ref, newStream);
          }
        } catch {
          // Stream decode failure — skip
        }
      }
    }

    // Remove XObject watermarks (full-page Form XObjects)
    const resources = pageDict.lookup(PDFName.of('Resources'));
    if (resources instanceof PDFDict) {
      const xObjects = resources.get(PDFName.of('XObject'));
      if (xObjects instanceof PDFDict) {
        const keys = xObjects.entries();
        for (const [key, ref] of keys) {
          if (!(ref instanceof PDFRef)) continue;
          const xObj = pdfDoc.context.lookup(ref);
          if (!(xObj instanceof PDFStream)) continue;
          const xDict = xObj.dict;
          const subtype = xDict.get(PDFName.of('Subtype'));
          if (!(subtype instanceof PDFName) || subtype.toString() !== '/Form') continue;

          // Check if the Form XObject name suggests watermark
          const nameStr = key.toString().toLowerCase();
          if (nameStr.includes('watermark') || nameStr.includes('wm')) {
            xObjects.delete(key);
            watermarksRemoved++;
          }
        }
      }
    }
  }

  onProgress?.({ stage: 'rebuilding', percent: 90, message: 'Rebuilding PDF...' });

  return { pdfDoc, watermarksRemoved };
}
