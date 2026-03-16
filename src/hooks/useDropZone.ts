import { useState, useCallback, useRef, type DragEvent } from 'react';
import { detectFileType } from '@/engines/detector';
import { MAX_FILE_SIZE, SUPPORTED_EXTENSIONS } from '@/lib/constants';
import type { DetectedFile } from '@/engines/types';

export type DropZoneState = 'idle' | 'dragging' | 'accepted' | 'rejected';

interface UseDropZoneReturn {
  state: DropZoneState;
  error: string | null;
  detectedFile: DetectedFile | null;
  onDragEnter: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
  openFilePicker: () => void;
  reset: () => void;
}

export function useDropZone(): UseDropZoneReturn {
  const [state, setState] = useState<DropZoneState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [detectedFile, setDetectedFile] = useState<DetectedFile | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const processFile = useCallback(async (file: File) => {
    setError(null);

    if (file.size > MAX_FILE_SIZE) {
      setState('rejected');
      setError(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
      return;
    }

    const detected = await detectFileType(file);
    if (!detected) {
      setState('rejected');
      setError(`Unsupported file type. Supported: ${SUPPORTED_EXTENSIONS.join(', ')}`);
      return;
    }

    setState('accepted');
    setDetectedFile(detected);
  }, []);

  const onDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState('dragging');
  }, []);

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setState('idle');
  }, []);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer?.files[0];
      if (file) {
        processFile(file);
      } else {
        setState('idle');
      }
    },
    [processFile]
  );

  const openFilePicker = useCallback(() => {
    if (!inputRef.current) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = SUPPORTED_EXTENSIONS.join(',');
      input.addEventListener('change', () => {
        const file = input.files?.[0];
        if (file) processFile(file);
        input.value = '';
      });
      inputRef.current = input;
    }
    inputRef.current.click();
  }, [processFile]);

  const reset = useCallback(() => {
    setState('idle');
    setError(null);
    setDetectedFile(null);
  }, []);

  return {
    state,
    error,
    detectedFile,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
    openFilePicker,
    reset,
  };
}
