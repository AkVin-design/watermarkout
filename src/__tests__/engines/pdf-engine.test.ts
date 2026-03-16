import { describe, it, expect, vi } from 'vitest';
import { cleanPdfStructural } from '@/engines/pdf-stream-cleaner';
import { PDFDocument } from 'pdf-lib';

describe('PDF structural cleaner', () => {
  it('processes a simple PDF without crashing', async () => {
    const doc = await PDFDocument.create();
    doc.addPage();
    const bytes = await doc.save();
    const data = new Uint8Array(bytes);

    const progressFn = vi.fn();
    const result = await cleanPdfStructural(data, progressFn);

    expect(result.pdfDoc).toBeDefined();
    expect(result.watermarksRemoved).toBe(0);
    expect(progressFn).toHaveBeenCalled();
  });

  it('processes multi-page PDF', async () => {
    const doc = await PDFDocument.create();
    doc.addPage();
    doc.addPage();
    doc.addPage();
    const bytes = await doc.save();
    const data = new Uint8Array(bytes);

    const result = await cleanPdfStructural(data);

    expect(result.pdfDoc.getPages()).toHaveLength(3);
    expect(result.watermarksRemoved).toBe(0);
  });

  it('reports progress correctly', async () => {
    const doc = await PDFDocument.create();
    doc.addPage();
    const bytes = await doc.save();
    const data = new Uint8Array(bytes);

    const stages: string[] = [];
    await cleanPdfStructural(data, (p) => stages.push(p.stage));

    expect(stages).toContain('loading');
    expect(stages).toContain('analyzing');
    expect(stages).toContain('removing');
    expect(stages).toContain('rebuilding');
  });
});

describe('generateFileName', () => {
  it('appends suffix before extension', async () => {
    const { generateFileName } = await import('@/engines/utils');
    expect(generateFileName('report.pdf')).toBe('report-cleaned.pdf');
    expect(generateFileName('document.docx', 'nowm')).toBe('document-nowm.docx');
  });

  it('handles files without extension', async () => {
    const { generateFileName } = await import('@/engines/utils');
    expect(generateFileName('readme')).toBe('readme-cleaned');
  });
});
