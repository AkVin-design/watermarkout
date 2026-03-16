export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export const features: Feature[] = [
  {
    icon: 'Shield',
    title: '100% Private',
    description: 'Files never leave your browser. Zero data collection. No cookies. No tracking.',
  },
  {
    icon: 'Zap',
    title: 'Lightning Fast',
    description: 'Processing happens locally using Web Workers. Most files complete in under 5 seconds.',
  },
  {
    icon: 'WifiOff',
    title: 'Works Offline',
    description: 'Install as a PWA and use anywhere — no internet connection required after first visit.',
  },
  {
    icon: 'FileStack',
    title: 'Multi-Format',
    description: 'Supports PDF, DOCX, JPEG, PNG, and WebP. Auto-detects file type from contents.',
  },
  {
    icon: 'Layers',
    title: 'Dual PDF Strategy',
    description: 'Structural analysis for clean removal, visual fallback for complex watermarks.',
  },
  {
    icon: 'SlidersHorizontal',
    title: 'Adjustable',
    description: 'Fine-tune detection sensitivity and output quality to match your needs.',
  },
];
