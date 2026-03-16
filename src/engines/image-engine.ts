import { detectWatermarkHSL, countMaskPixels } from './image-hsl-detector';
import { inpaintMask } from './image-inpainter';
import { generateFileName } from './utils';
import type { ProcessingOptions, ProcessingResult, ProgressCallback, ImageSubtype } from './types';

function getOutputMime(subtype?: ImageSubtype): string {
  switch (subtype) {
    case 'png': return 'image/png';
    case 'webp': return 'image/webp';
    default: return 'image/jpeg';
  }
}

function getOutputQuality(options: ProcessingOptions): number {
  switch (options.quality) {
    case 'fast': return 0.85;
    case 'balanced': return 0.92;
    case 'high': return 0.97;
  }
}

export async function processImage(
  file: File,
  options: ProcessingOptions,
  imageSubtype?: ImageSubtype,
  onProgress?: ProgressCallback
): Promise<ProcessingResult> {
  const startTime = performance.now();

  onProgress?.({ stage: 'loading', percent: 10, message: 'Loading image...' });

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  onProgress?.({ stage: 'analyzing', percent: 30, message: 'Detecting watermarks...' });

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const mask = detectWatermarkHSL(imageData, options.sensitivity);
  const watermarkPixels = countMaskPixels(mask);

  let watermarksFound = 0;
  if (watermarkPixels > 100) {
    watermarksFound = 1;
    onProgress?.({ stage: 'removing', percent: 50, message: 'Removing watermarks...' });
    inpaintMask(imageData, mask);
    ctx.putImageData(imageData, 0, 0);
  }

  onProgress?.({ stage: 'rebuilding', percent: 85, message: 'Encoding result...' });

  const mime = getOutputMime(imageSubtype);
  const quality = getOutputQuality(options);

  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob(
      (b) => resolve(b!),
      mime,
      quality
    );
  });

  onProgress?.({ stage: 'done', percent: 100, message: 'Done!' });

  return {
    blob,
    fileName: generateFileName(file.name),
    originalSize: file.size,
    processedSize: blob.size,
    watermarksFound,
    strategy: 'hsl-inpaint',
    duration: performance.now() - startTime,
  };
}
