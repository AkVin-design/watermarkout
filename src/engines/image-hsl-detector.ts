/**
 * HSL-based watermark pixel detection.
 *
 * Watermarks are typically semi-transparent grey/white overlays:
 * - Low saturation (near grey)
 * - High lightness (near white)
 *
 * Returns a boolean mask where `true` = likely watermark pixel.
 */

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return [0, 0, l];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return [h, s, l];
}

/**
 * Detect watermark pixels using HSL analysis.
 *
 * @param imageData - Canvas ImageData
 * @param sensitivity - 0-100, higher = more aggressive detection
 * @returns Boolean array (one per pixel): true = watermark
 */
export function detectWatermarkHSL(imageData: ImageData, sensitivity: number = 50): boolean[] {
  const { data, width, height } = imageData;
  const pixelCount = width * height;
  const mask = new Array<boolean>(pixelCount).fill(false);

  // Map sensitivity 0-100 to thresholds
  // Higher sensitivity = looser thresholds (detects more)
  const satThreshold = 0.15 + (sensitivity / 100) * 0.2; // 0.15 - 0.35
  const lightThresholdMin = 0.85 - (sensitivity / 100) * 0.25; // 0.85 - 0.60
  const alphaThreshold = 200 - Math.round((sensitivity / 100) * 80); // 200 - 120

  for (let i = 0; i < pixelCount; i++) {
    const offset = i * 4;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    const a = data[offset + 3];

    // Skip fully transparent pixels
    if (a < 10) continue;

    // Semi-transparent pixels are likely watermark
    if (a < alphaThreshold && a > 10) {
      const [, s, l] = rgbToHsl(r, g, b);
      if (s < satThreshold && l > lightThresholdMin) {
        mask[i] = true;
        continue;
      }
    }

    // Fully opaque but very light and unsaturated
    const [, s, l] = rgbToHsl(r, g, b);
    if (s < satThreshold * 0.5 && l > lightThresholdMin + 0.05) {
      // Additional check: pixel is close to its neighbors (uniform patch = likely watermark text/shape)
      mask[i] = true;
    }
  }

  return mask;
}

/**
 * Count watermark pixels in a mask.
 */
export function countMaskPixels(mask: boolean[]): number {
  let count = 0;
  for (let i = 0; i < mask.length; i++) {
    if (mask[i]) count++;
  }
  return count;
}
