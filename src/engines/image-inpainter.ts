/**
 * Neighbourhood-average inpainting.
 *
 * For each masked pixel, compute the weighted average of non-masked
 * neighbours within a radius, using inverse-distance weighting.
 * This produces smooth fill-ins that blend with surrounding content.
 */

const DEFAULT_RADIUS = 5;

/**
 * Inpaint masked pixels in-place on the ImageData.
 *
 * @param imageData - Canvas ImageData (modified in-place)
 * @param mask - Boolean array (true = pixel to replace)
 * @param radius - Neighbourhood radius (default 5)
 */
export function inpaintMask(
  imageData: ImageData,
  mask: boolean[],
  radius: number = DEFAULT_RADIUS
): void {
  const { data, width, height } = imageData;

  // Clone the original data so we read from unmodified values
  const original = new Uint8ClampedArray(data);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (!mask[idx]) continue;

      let rSum = 0, gSum = 0, bSum = 0, wSum = 0;

      const yMin = Math.max(0, y - radius);
      const yMax = Math.min(height - 1, y + radius);
      const xMin = Math.max(0, x - radius);
      const xMax = Math.min(width - 1, x + radius);

      for (let ny = yMin; ny <= yMax; ny++) {
        for (let nx = xMin; nx <= xMax; nx++) {
          const nIdx = ny * width + nx;
          if (mask[nIdx]) continue; // Skip other masked pixels

          const dx = nx - x;
          const dy = ny - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > radius) continue;

          const w = 1 / (1 + dist);
          const nOffset = nIdx * 4;
          rSum += original[nOffset] * w;
          gSum += original[nOffset + 1] * w;
          bSum += original[nOffset + 2] * w;
          wSum += w;
        }
      }

      const offset = idx * 4;
      if (wSum > 0) {
        data[offset] = Math.round(rSum / wSum);
        data[offset + 1] = Math.round(gSum / wSum);
        data[offset + 2] = Math.round(bSum / wSum);
        data[offset + 3] = 255; // Fully opaque
      }
    }
  }
}
