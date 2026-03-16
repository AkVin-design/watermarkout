import { describe, it, expect } from 'vitest';
import { detectFileType } from '@/engines/detector';

function makeFile(bytes: number[], name: string, type = ''): File {
  const buffer = new Uint8Array(bytes);
  return new File([buffer], name, { type });
}

describe('detectFileType', () => {
  it('detects PDF from magic bytes', async () => {
    const file = makeFile([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34], 'test.pdf');
    const result = await detectFileType(file);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('pdf');
  });

  it('detects JPEG from magic bytes', async () => {
    const file = makeFile([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10], 'photo.jpg');
    const result = await detectFileType(file);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('image');
    expect(result!.imageSubtype).toBe('jpeg');
  });

  it('detects PNG from magic bytes', async () => {
    const file = makeFile([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 'image.png');
    const result = await detectFileType(file);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('image');
    expect(result!.imageSubtype).toBe('png');
  });

  it('detects WebP from magic bytes', async () => {
    // RIFF....WEBP
    const bytes = [
      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
    ];
    const file = makeFile(bytes, 'image.webp');
    const result = await detectFileType(file);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('image');
    expect(result!.imageSubtype).toBe('webp');
  });

  it('detects DOCX from ZIP magic bytes + .docx extension', async () => {
    const file = makeFile([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00], 'document.docx');
    const result = await detectFileType(file);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('docx');
  });

  it('rejects ZIP file without .docx extension', async () => {
    const file = makeFile([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00], 'archive.zip');
    const result = await detectFileType(file);
    expect(result).toBeNull();
  });

  it('falls back to extension when magic bytes unknown', async () => {
    const file = makeFile([0x00, 0x00, 0x00], 'test.pdf');
    const result = await detectFileType(file);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('pdf');
  });

  it('returns null for unsupported file type', async () => {
    const file = makeFile([0x00, 0x00, 0x00], 'readme.txt');
    const result = await detectFileType(file);
    expect(result).toBeNull();
  });

  it('handles empty file name gracefully', async () => {
    const file = makeFile([0x25, 0x50, 0x44, 0x46, 0x2d], '');
    const result = await detectFileType(file);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('pdf');
  });
});
