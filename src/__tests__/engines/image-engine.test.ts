import { describe, it, expect } from 'vitest';
import { detectWatermarkHSL, countMaskPixels } from '@/engines/image-hsl-detector';
import { inpaintMask } from '@/engines/image-inpainter';

function makeImageData(width: number, height: number, fillFn: (x: number, y: number) => [number, number, number, number]): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = fillFn(x, y);
      const i = (y * width + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = a;
    }
  }
  return { data, width, height, colorSpace: 'srgb' } as ImageData;
}

describe('image-hsl-detector', () => {
  it('detects semi-transparent light pixels as watermark', () => {
    // Create image with a light semi-transparent watermark patch
    const img = makeImageData(10, 10, (x, y) => {
      if (x < 5 && y < 5) {
        // Watermark area: light grey, semi-transparent
        return [240, 240, 240, 100];
      }
      // Normal content: dark, fully opaque
      return [50, 80, 120, 255];
    });

    const mask = detectWatermarkHSL(img, 50);
    expect(mask.length).toBe(100);

    // At least some watermark pixels should be detected
    const wmPixels = countMaskPixels(mask);
    expect(wmPixels).toBeGreaterThan(0);
  });

  it('does not flag dark opaque pixels', () => {
    const img = makeImageData(10, 10, () => [30, 30, 30, 255]);
    const mask = detectWatermarkHSL(img, 50);
    const wmPixels = countMaskPixels(mask);
    expect(wmPixels).toBe(0);
  });

  it('skips fully transparent pixels', () => {
    const img = makeImageData(10, 10, () => [255, 255, 255, 0]);
    const mask = detectWatermarkHSL(img, 50);
    const wmPixels = countMaskPixels(mask);
    expect(wmPixels).toBe(0);
  });

  it('higher sensitivity detects more pixels', () => {
    const img = makeImageData(10, 10, () => [200, 200, 200, 150]);
    const maskLow = detectWatermarkHSL(img, 20);
    const maskHigh = detectWatermarkHSL(img, 80);
    expect(countMaskPixels(maskHigh)).toBeGreaterThanOrEqual(countMaskPixels(maskLow));
  });
});

describe('image-inpainter', () => {
  it('replaces masked pixels with neighbour average', () => {
    // Create a 5x5 image: center pixel is masked, surrounded by red
    const img = makeImageData(5, 5, (x, y) => {
      if (x === 2 && y === 2) return [255, 255, 255, 255]; // Center: white (watermark)
      return [200, 50, 50, 255]; // Surrounding: red
    });

    const mask = new Array(25).fill(false);
    mask[12] = true; // Center pixel

    inpaintMask(img, mask, 2);

    // Center pixel should now be close to red
    const ci = 12 * 4;
    expect(img.data[ci]).toBeGreaterThan(100); // R should be high
    expect(img.data[ci + 1]).toBeLessThan(100); // G should be low
    expect(img.data[ci + 2]).toBeLessThan(100); // B should be low
    expect(img.data[ci + 3]).toBe(255); // Fully opaque
  });

  it('does not modify non-masked pixels', () => {
    const img = makeImageData(3, 3, () => [100, 100, 100, 255]);
    const mask = new Array(9).fill(false);

    inpaintMask(img, mask);

    for (let i = 0; i < 9; i++) {
      expect(img.data[i * 4]).toBe(100);
    }
  });
});
