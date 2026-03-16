import { processPdf } from '@/engines/pdf-engine';
import type { ProcessingOptions, ProcessingProgress, ProcessingResult } from '@/engines/types';

export interface PdfWorkerMessage {
  type: 'process';
  file: File;
  options: ProcessingOptions;
}

export interface PdfWorkerResponse {
  type: 'progress' | 'result' | 'error';
  progress?: ProcessingProgress;
  result?: ProcessingResult;
  error?: string;
}

self.onmessage = async (e: MessageEvent<PdfWorkerMessage>) => {
  if (e.data.type !== 'process') return;

  try {
    const result = await processPdf(e.data.file, e.data.options, (progress) => {
      self.postMessage({ type: 'progress', progress } satisfies PdfWorkerResponse);
    });
    self.postMessage({ type: 'result', result } satisfies PdfWorkerResponse);
  } catch (err) {
    self.postMessage({
      type: 'error',
      error: err instanceof Error ? err.message : 'PDF processing failed',
    } satisfies PdfWorkerResponse);
  }
};
