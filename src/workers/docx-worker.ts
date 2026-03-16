import { processDocx } from '@/engines/docx-engine';
import type { ProcessingProgress, ProcessingResult } from '@/engines/types';

export interface DocxWorkerMessage {
  type: 'process';
  file: File;
}

export interface DocxWorkerResponse {
  type: 'progress' | 'result' | 'error';
  progress?: ProcessingProgress;
  result?: ProcessingResult;
  error?: string;
}

self.onmessage = async (e: MessageEvent<DocxWorkerMessage>) => {
  if (e.data.type !== 'process') return;

  try {
    const result = await processDocx(e.data.file, (progress) => {
      self.postMessage({ type: 'progress', progress } satisfies DocxWorkerResponse);
    });
    self.postMessage({ type: 'result', result } satisfies DocxWorkerResponse);
  } catch (err) {
    self.postMessage({
      type: 'error',
      error: err instanceof Error ? err.message : 'DOCX processing failed',
    } satisfies DocxWorkerResponse);
  }
};
