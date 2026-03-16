export function generateWebAppSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'WatermarkOut',
    description:
      'Remove watermarks from PDFs, Word documents, and images. Completely private — files never leave your browser.',
    url: 'https://watermarkout.com',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
}
