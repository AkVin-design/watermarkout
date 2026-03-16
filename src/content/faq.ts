export interface FaqItem {
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    question: 'Is this really free?',
    answer:
      'Yes, completely free with no limits. Since all processing happens in your browser, there are no server costs to cover.',
  },
  {
    question: 'Are my files safe?',
    answer:
      'Your files never leave your device. All processing happens locally in your browser using JavaScript. We have no servers that receive your files, no analytics that track your uploads, and no way to access your data.',
  },
  {
    question: 'What types of watermarks can be removed?',
    answer:
      'WatermarkOut handles text watermarks, image overlays, semi-transparent stamps, and background watermarks. For PDFs, we use both structural analysis and visual processing. For DOCX files, we strip VML shapes and DrawingML elements. For images, we use HSL-based pixel detection.',
  },
  {
    question: 'Does it work offline?',
    answer:
      'Yes! WatermarkOut is a Progressive Web App (PWA). Once you visit the site, it caches everything needed to work offline. You can even install it as an app on your device.',
  },
  {
    question: 'What file formats are supported?',
    answer:
      'PDF (.pdf), Word documents (.docx), and images (JPEG, PNG, WebP). Maximum file size is 100MB.',
  },
  {
    question: 'Will it damage my document?',
    answer:
      'The structural PDF mode preserves text selectability and document structure. The visual mode and image processing create pixel-based output. We always generate a new file — your original is never modified.',
  },
  {
    question: 'Can I use this for copyrighted content?',
    answer:
      'WatermarkOut is a tool. You are responsible for ensuring you have the right to modify any files you process. Do not use this tool to remove watermarks from content you do not own or have permission to modify.',
  },
];
