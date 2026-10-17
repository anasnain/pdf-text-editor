import { PDFPageProxy } from '@/types/pdf.types';

/**
 * Extract text color from PDF content stream
 * Uses pdf.js getOperatorList to parse raw PDF operators
 */

interface ColorState {
  fillColor: number[] | null;
  strokeColor: number[] | null;
}

interface TextPosition {
  text: string;
  x: number;
  y: number;
  fillColor: number[] | null;
  backgroundColor: number[] | null;
}

/**
 * Parse PDF operators to extract text with colors
 * This uses the low-level pdf.js API to read graphics state
 */
export async function extractTextWithColors(
  page: PDFPageProxy
): Promise<Map<string, { fillColor: number[]; backgroundColor: number[] | null }>> {
  const colorMap = new Map<string, { fillColor: number[]; backgroundColor: number[] | null }>();

  try {
    // Check if getOperatorList is available (it's a non-standard API)
    if (typeof (page as any).getOperatorList !== 'function') {
      console.warn('⚠️ getOperatorList() not available - falling back to basic color extraction');
      return colorMap;
    }

    // Get operator list - this contains raw PDF drawing commands
    const operatorList = await (page as any).getOperatorList();

    const ops = operatorList.fnArray;
    const args = operatorList.argsArray;

    let currentFillColor: number[] = [0, 0, 0]; // Default black
    let currentBackgroundColor: number[] | null = null;
    let textMatrix: number[] = [1, 0, 0, 1, 0, 0];

    // PDF operator constants from pdf.js
    const OPS = {
      setFillRGBColor: 20,      // rg - Set RGB fill color
      setStrokeRGBColor: 21,    // RG - Set RGB stroke color
      setFillGray: 22,          // g - Set gray fill
      setStrokeGray: 23,        // G - Set gray stroke
      setFillColorSpace: 24,    // cs - Set fill color space
      setStrokeColorSpace: 25,  // CS - Set stroke color space
      setFillColor: 26,         // sc/scn - Set fill color
      setStrokeColor: 27,       // SC/SCN - Set stroke color
      showText: 39,             // Tj - Show text
      showSpacedText: 40,       // TJ - Show text with spacing
      setTextMatrix: 41,        // Tm - Set text matrix
      paintFormXObjectBegin: 65, // Do - Draw XObject (might include backgrounds)
      constructPath: 72,         // Path construction
      fill: 73,                  // f/F - Fill path (potential background)
      eoFill: 74,               // f* - Even-odd fill
      fillStroke: 75,           // B - Fill and stroke
      rectangle: 79,            // re - Rectangle (background candidate)
    };

    let colorCount = 0;
    let bgCount = 0;

    for (let i = 0; i < ops.length; i++) {
      const op = ops[i];
      const arg = args[i];

      // Track fill color changes (text color)
      if (op === OPS.setFillRGBColor) {
        // rg operator: arg is [r, g, b] in 0-1 range
        try {
          if (Array.isArray(arg) && arg.length >= 3) {
            currentFillColor = [
              Math.round(arg[0] * 255),
              Math.round(arg[1] * 255),
              Math.round(arg[2] * 255)
            ];
            colorCount++;
          }
        } catch (e) {
          // Skip if parsing fails
        }
      } else if (op === OPS.setFillGray) {
        // g operator: arg is [gray] in 0-1 range
        try {
          const grayVal = Array.isArray(arg) ? arg[0] : arg;
          if (typeof grayVal === 'number') {
            const gray = Math.round(grayVal * 255);
            currentFillColor = [gray, gray, gray];
            colorCount++;
          }
        } catch (e) {
          // Skip if parsing fails
        }
      }

      // Track rectangles (potential backgrounds)
      else if (op === OPS.rectangle) {
        // Next fill operation might be the background
      }

      // Track fill operations (backgrounds)
      else if (op === OPS.fill || op === OPS.eoFill) {
        // Background was just drawn with current fill color
        currentBackgroundColor = [...currentFillColor];
        bgCount++;
      }

      // Track text rendering
      else if (op === OPS.showText || op === OPS.showSpacedText) {
        // Text is rendered with current fill color
        let text = '';

        try {
          if (op === OPS.showText) {
            // Tj operator: arg can be string directly or arg[0]
            text = typeof arg === 'string' ? arg : (arg[0] || '');
          } else {
            // TJ operator: arg is array with strings and numbers
            if (Array.isArray(arg)) {
              // arg might be the array itself, or arg[0] might be the array
              const textArray = Array.isArray(arg[0]) ? arg[0] : arg;
              text = textArray
                .filter((item: any) => typeof item === 'string')
                .join('');
            } else if (typeof arg === 'string') {
              text = arg;
            }
          }

          if (text && typeof text === 'string' && text.trim()) {
            // Store color mapping by text content
            colorMap.set(text.trim(), {
              fillColor: [...currentFillColor],
              backgroundColor: currentBackgroundColor ? [...currentBackgroundColor] : null
            });
          }
        } catch (e) {
          // Skip this text item if we can't parse it
        }

        // Reset background after text (it's not persistent)
        currentBackgroundColor = null;
      }
    }

    if (colorMap.size > 0) {
      console.log(`  📊 Parsed ${ops.length} operators: ${colorCount} colors, ${bgCount} fills, ${colorMap.size} text items`);
    }
    return colorMap;

  } catch (error) {
    console.error('Error extracting text colors:', error);
    return new Map();
  }
}

/**
 * Convert color array [r, g, b] to CSS rgb() string
 */
export function colorArrayToCSS(color: number[] | null): string {
  if (!color || color.length < 3) return 'rgb(0, 0, 0)';
  return `rgb(${Math.round(color[0])}, ${Math.round(color[1])}, ${Math.round(color[2])})`;
}

/**
 * Convert CSS rgb() string to pdf-lib rgb() object
 */
export function colorArrayToPDFLib(color: number[]): { r: number; g: number; b: number } {
  return {
    r: color[0] / 255,
    g: color[1] / 255,
    b: color[2] / 255,
  };
}
