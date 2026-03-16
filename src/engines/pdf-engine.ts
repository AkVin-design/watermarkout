import { cleanPdfStructural } from './pdf-stream-cleaner';
import { cleanPdfVisual } from './pdf-canvas-cleaner';
import { generateFileName } from './utils';
import type { ProcessingOptions, ProcessingResult, ProgressCallback } from './types';

export async function processPdf(
  file: File,
  options: ProcessingOptions,
  onProgress?: ProgressCallback
): Promise<ProcessingResult> {
  const startTime = performance.now();
  const buffer = await file.arrayBuffer();
  const data = new Uint8Array(buffer);

  // Strategy selection
  if (options.pdfStrategy === 'visual') {
    return processVisual(file, data, options, onProgress, startTime);
  }

  // Structural first (or 'auto')
  onProgress?.({ stage: 'analyzing', percent: 5, message: 'Trying structural analysis...' });

  try {
    const result = await cleanPdfStructural(data, onProgress);

    if (result.watermarksRemoved > 0 || options.pdfStrategy === 'structural') {
      onProgress?.({ stage: 'rebuilding', percent: 95, message: 'Saving cleaned PDF...' });
      const pdfBytes = await result.pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });

      onProgress?.({ stage: 'done', percent: 100, message: 'Done!' });
      return {
        blob,
        fileName: generateFileName(file.name),
        originalSize: file.size,
        processedSize: blob.size,
        watermarksFound: result.watermarksRemoved,
        strategy: 'structural',
        duration: performance.now() - startTime,
      };
    }
  } catch {
    // Structural failed — fall through to visual
  }

  // Auto mode: no watermarks found structurally, try visual
  if (options.pdfStrategy === 'auto') {
    onProgress?.({ stage: 'analyzing', percent: 10, message: 'No structural watermarks found. Trying visual analysis...' });
    return processVisual(file, data, options, onProgress, startTime);
  }

  // No watermarks found
  onProgress?.({ stage: 'done', percent: 100, message: 'No watermarks detected.' });
  const pdfBytes = data;
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  return {
    blob,
    fileName: generateFileName(file.name),
    originalSize: file.size,
    processedSize: blob.size,
    watermarksFound: 0,
    strategy: 'structural',
    duration: performance.now() - startTime,
  };
}

async function processVisual(
  file: File,
  data: Uint8Array,
  options: ProcessingOptions,
  onProgress: ProgressCallback | undefined,
  startTime: number
): Promise<ProcessingResult> {
  const result = await cleanPdfVisual(data, options, onProgress);

  onProgress?.({ stage: 'done', percent: 100, message: 'Done!' });
  return {
    blob: result.blob,
    fileName: generateFileName(file.name),
    originalSize: file.size,
    processedSize: result.blob.size,
    watermarksFound: result.watermarksFound,
    strategy: 'visual',
    duration: performance.now() - startTime,
  };
}
