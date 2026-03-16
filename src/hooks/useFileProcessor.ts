import { useState, useCallback, useRef } from 'react';
import { processPdf } from '@/engines/pdf-engine';
import { processDocx } from '@/engines/docx-engine';
import { processImage } from '@/engines/image-engine';
import type {
  DetectedFile,
  ProcessingOptions,
  ProcessingProgress,
  ProcessingResult,
} from '@/engines/types';

export type ProcessorState = 'idle' | 'processing' | 'done' | 'error';

interface UseFileProcessorReturn {
  state: ProcessorState;
  progress: ProcessingProgress | null;
  result: ProcessingResult | null;
  resultUrl: string | null;
  error: string | null;
  process: (file: DetectedFile, options: ProcessingOptions) => Promise<void>;
  reset: () => void;
}

export function useFileProcessor(): UseFileProcessorReturn {
  const [state, setState] = useState<ProcessorState>('idle');
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);

  const revokeUrl = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);

  const process = useCallback(
    async (detectedFile: DetectedFile, options: ProcessingOptions) => {
      revokeUrl();
      setState('processing');
      setProgress(null);
      setResult(null);
      setResultUrl(null);
      setError(null);

      try {
        let processingResult: ProcessingResult;

        const onProgress = (p: ProcessingProgress) => setProgress(p);

        switch (detectedFile.type) {
          case 'pdf':
            processingResult = await processPdf(detectedFile.file, options, onProgress);
            break;
          case 'docx':
            processingResult = await processDocx(detectedFile.file, onProgress);
            break;
          case 'image':
            processingResult = await processImage(
              detectedFile.file,
              options,
              detectedFile.imageSubtype,
              onProgress
            );
            break;
        }

        const url = URL.createObjectURL(processingResult.blob);
        urlRef.current = url;

        setResult(processingResult);
        setResultUrl(url);
        setState('done');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Processing failed');
        setState('error');
      }
    },
    [revokeUrl]
  );

  const reset = useCallback(() => {
    revokeUrl();
    setState('idle');
    setProgress(null);
    setResult(null);
    setResultUrl(null);
    setError(null);
  }, [revokeUrl]);

  return { state, progress, result, resultUrl, error, process, reset };
}

export { DEFAULT_OPTIONS } from '@/engines/types';
