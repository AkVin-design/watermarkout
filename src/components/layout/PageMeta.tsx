import { useEffect } from 'react';

interface PageMetaProps {
  title: string;
  description?: string;
}

export function PageMeta({ title, description }: PageMetaProps) {
  useEffect(() => {
    const fullTitle = title === 'WatermarkOut'
      ? 'WatermarkOut — Remove Watermarks Privately'
      : `${title} — WatermarkOut`;
    document.title = fullTitle;

    if (description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', description);
    }
  }, [title, description]);

  return null;
}
