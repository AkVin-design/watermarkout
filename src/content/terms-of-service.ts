export interface TermsSection {
  heading: string;
  content: string;
}

export const termsOfService: TermsSection[] = [
  {
    heading: 'Acceptance of Terms',
    content:
      'By using WatermarkOut, you agree to these terms. If you do not agree, please do not use the service.',
  },
  {
    heading: 'Service Description',
    content:
      'WatermarkOut is a free, client-side tool for removing watermarks from files. The service is provided "as is" without warranties of any kind.',
  },
  {
    heading: 'User Responsibility',
    content:
      'You are solely responsible for the files you process and how you use the output. You must ensure you have the legal right to modify any files you process. Do not use WatermarkOut to infringe on copyrights, remove attribution from licensed content, or circumvent digital rights management.',
  },
  {
    heading: 'Intellectual Property',
    content:
      'You retain all rights to your files. WatermarkOut does not claim any ownership over files you process. Since files never leave your browser, we have no ability to access or use them.',
  },
  {
    heading: 'No Warranty',
    content:
      'WatermarkOut is provided without warranty. We do not guarantee that watermark removal will be perfect or complete. Results may vary depending on the type and complexity of watermarks. Always verify the output before using it.',
  },
  {
    heading: 'Limitation of Liability',
    content:
      'WatermarkOut and its creators shall not be liable for any damages arising from the use of this tool, including but not limited to data loss, file corruption, or legal consequences of misuse.',
  },
  {
    heading: 'Changes to Terms',
    content:
      'We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.',
  },
];
