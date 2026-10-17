/**
 * Detect if text is on a dark background by sampling canvas pixels
 */

export interface BackgroundColorInfo {
  isDark: boolean;
  averageColor: {r: number; g: number; b: number};
  luminance: number;
}

/**
 * Sample pixels from canvas to detect background color
 * This is more reliable than parsing PDF operators
 */
export function detectBackgroundColor(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  width: number,
  height: number
): BackgroundColorInfo {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { isDark: false, averageColor: {r: 255, g: 255, b: 255}, luminance: 1 };
  }

  // Sample multiple points in the bounding box
  const samples: {r: number; g: number; b: number}[] = [];
  const samplePoints = [
    {x: x + width * 0.1, y: y + height * 0.5},  // Left edge
    {x: x + width * 0.5, y: y + height * 0.5},  // Center
    {x: x + width * 0.9, y: y + height * 0.5},  // Right edge
  ];

  for (const point of samplePoints) {
    try {
      const imageData = ctx.getImageData(Math.floor(point.x), Math.floor(point.y), 1, 1);
      const [r, g, b] = imageData.data;
      samples.push({r, g, b});
    } catch (e) {
      // Skip if pixel read fails
    }
  }

  if (samples.length === 0) {
    return { isDark: false, averageColor: {r: 255, g: 255, b: 255}, luminance: 1 };
  }

  // Calculate average color
  const avgR = Math.round(samples.reduce((sum, s) => sum + s.r, 0) / samples.length);
  const avgG = Math.round(samples.reduce((sum, s) => sum + s.g, 0) / samples.length);
  const avgB = Math.round(samples.reduce((sum, s) => sum + s.b, 0) / samples.length);

  // Calculate relative luminance (perceived brightness)
  // Formula: 0.299*R + 0.587*G + 0.114*B
  const luminance = (0.299 * avgR + 0.587 * avgG + 0.114 * avgB) / 255;

  // Dark background if luminance < 0.5
  const isDark = luminance < 0.5;

  return {
    isDark,
    averageColor: {r: avgR, g: avgG, b: avgB},
    luminance
  };
}
