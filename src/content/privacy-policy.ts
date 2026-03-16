export interface PolicySection {
  heading: string;
  content: string;
}

export const privacyPolicy: PolicySection[] = [
  {
    heading: 'Overview',
    content:
      'WatermarkOut is a client-side web application. All file processing occurs entirely within your web browser. We do not collect, store, transmit, or have access to any files you process.',
  },
  {
    heading: 'Data Collection',
    content:
      'We collect zero personal data. No cookies. No analytics. No tracking pixels. No server logs of your usage. The application runs entirely in your browser and makes no network requests during file processing.',
  },
  {
    heading: 'File Processing',
    content:
      'When you drop a file into WatermarkOut, it is processed entirely within your browser using JavaScript. Your files are never uploaded to any server. They remain on your device at all times. Processed files exist only in your browser\'s memory until you download them.',
  },
  {
    heading: 'Local Storage',
    content:
      'WatermarkOut uses browser localStorage solely to remember your theme preference (dark/light mode). No file data, processing history, or personal information is stored.',
  },
  {
    heading: 'Service Worker',
    content:
      'WatermarkOut uses a Service Worker to enable offline functionality. The Service Worker caches only the application\'s static assets (HTML, CSS, JavaScript). It does not cache or store any of your files.',
  },
  {
    heading: 'Third-Party Services',
    content:
      'WatermarkOut loads fonts from Google Fonts on first visit. No other third-party services are used. No advertising. No analytics platforms.',
  },
  {
    heading: 'Open Source',
    content:
      'The entire source code of WatermarkOut is available for review. You can verify that no data is collected or transmitted by inspecting the code yourself.',
  },
  {
    heading: 'Contact',
    content:
      'If you have questions about this privacy policy, you can reach us through our GitHub repository.',
  },
];
