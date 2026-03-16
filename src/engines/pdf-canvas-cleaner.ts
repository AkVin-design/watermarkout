import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';
import { detectWatermarkHSL } from './image-hsl-detector';
import { inpaintMask } from './image-inpainter';
import type { ProgressCallback, ProcessingOptions } from './types';

// Set worker source inline to avoid external file dependency
pdfjsLib.GlobalWorkerOptions.workerSrc = '';

interface CanvasCleanResult {
  blob: Blob;
  watermarksFound: number;
}

export async function cleanPdfVisual(
  data: Uint8Array,
  options: ProcessingOptions,
  onProgress?: ProgressCallback
): Promise<CanvasCleanResult> {
  onProgress?.({ stage: 'loading', percent: 5, message: 'Loading PDF for visual processing...' });

  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  let totalWatermarks = 0;

  // We'll collect page images and dimensions
  const pageImages: { imgData: string; width: number; height: number }[] = [];

  for (let i = 1; i <= numPages; i++) {
    onProgress?.({
      stage: 'analyzing',
      percent: 5 + Math.round((i / numPages) * 50),
      message: `Rendering page ${i} of ${numPages}...`,
    });

    const page = await pdf.getPage(i);
    const scale = 2; // 2x for quality
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;

    await page.render({ canvasContext: ctx, viewport }).promise;

    // Detect and remove watermarks from the rendered canvas
    onProgress?.({
      stage: 'removing',
      percent: 55 + Math.round((i / numPages) * 30),
      message: `Cleaning page ${i} of ${numPages}...`,
    });

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const mask = detectWatermarkHSL(imageData, options.sensitivity);

    // Count watermark pixels
    let watermarkPixels = 0;
    for (let j = 0; j < mask.length; j++) {
      if (mask[j]) watermarkPixels++;
    }

    if (watermarkPixels > 100) {
      totalWatermarks++;
      inpaintMask(imageData, mask);
      ctx.putImageData(imageData, 0, 0);
    }

    pageImages.push({
      imgData: canvas.toDataURL('image/jpeg', 0.92),
      width: viewport.width / scale,
      height: viewport.height / scale,
    });
  }

  onProgress?.({ stage: 'rebuilding', percent: 90, message: 'Rebuilding PDF from pages...' });

  // Rebuild PDF using jsPDF
  const firstPage = pageImages[0];
  const doc = new jsPDF({
    orientation: firstPage.width > firstPage.height ? 'landscape' : 'portrait',
    unit: 'pt',
    format: [firstPage.width, firstPage.height],
  });

  for (let i = 0; i < pageImages.length; i++) {
    const { imgData, width, height } = pageImages[i];
    if (i > 0) {
      doc.addPage([width, height], width > height ? 'landscape' : 'portrait');
    }
    doc.addImage(imgData, 'JPEG', 0, 0, width, height);
  }

  const pdfBlob = doc.output('blob');
  return { blob: pdfBlob, watermarksFound: totalWatermarks };
}
