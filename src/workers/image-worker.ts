import { processImage } from '@/engines/image-engine';
import type { ProcessingOptions, ProcessingProgress, ProcessingResult, ImageSubtype } from '@/engines/types';

export interface ImageWorkerMessage {
  type: 'process';
  file: File;
  options: ProcessingOptions;
  imageSubtype?: ImageSubtype;
}

export interface ImageWorkerResponse {
  type: 'progress' | 'result' | 'error';
  progress?: ProcessingProgress;
  result?: ProcessingResult;
  error?: string;
}

self.onmessage = async (e: MessageEvent<ImageWorkerMessage>) => {
  if (e.data.type !== 'process') return;

  try {
    const result = await processImage(
      e.data.file,
      e.data.options,
      e.data.imageSubtype,
      (progress) => {
        self.postMessage({ type: 'progress', progress } satisfies ImageWorkerResponse);
      }
    );
    self.postMessage({ type: 'result', result } satisfies ImageWorkerResponse);
  } catch (err) {
    self.postMessage({
      type: 'error',
      error: err instanceof Error ? err.message : 'Image processing failed',
    } satisfies ImageWorkerResponse);
  }
};
