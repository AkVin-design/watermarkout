export type FileType = 'pdf' | 'docx' | 'image';

export type ImageSubtype = 'jpeg' | 'png' | 'webp';

export type PdfStrategy = 'structural' | 'visual' | 'auto';

export interface DetectedFile {
  file: File;
  type: FileType;
  imageSubtype?: ImageSubtype;
}

export interface ProcessingOptions {
  pdfStrategy: PdfStrategy;
  sensitivity: number; // 0-100, default 50
  quality: 'fast' | 'balanced' | 'high';
}

export const DEFAULT_OPTIONS: ProcessingOptions = {
  pdfStrategy: 'auto',
  sensitivity: 50,
  quality: 'balanced',
};

export type ProcessingStage =
  | 'detecting'
  | 'loading'
  | 'analyzing'
  | 'removing'
  | 'rebuilding'
  | 'done';

export interface ProcessingProgress {
  stage: ProcessingStage;
  percent: number;
  message: string;
}

export type ProgressCallback = (progress: ProcessingProgress) => void;

export interface ProcessingResult {
  blob: Blob;
  fileName: string;
  originalSize: number;
  processedSize: number;
  watermarksFound: number;
  strategy?: string;
  duration: number;
}
