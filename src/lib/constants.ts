export const APP_VERSION = '1.0.0';
export const APP_NAME = 'WatermarkOut';

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

export const SUPPORTED_EXTENSIONS = ['.pdf', '.docx', '.jpg', '.jpeg', '.png', '.webp'] as const;

export const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const FILE_TYPE_LABELS: Record<string, string> = {
  pdf: 'PDF Document',
  docx: 'Word Document',
  image: 'Image',
};

export const FILE_TYPE_COLORS: Record<string, string> = {
  pdf: 'var(--color-pdf)',
  docx: 'var(--color-docx)',
  image: 'var(--color-image)',
};
