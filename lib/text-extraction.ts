import { PDFPageProxy, TextItem, PDFJSTextItem } from '@/types/pdf.types';

/**
 * Extract text items with position and styling information from a PDF page
 */
export async function extractTextItems(
  page: PDFPageProxy,
  scale: number = 1.5
): Promise<TextItem[]> {
  try {

    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale });
    const textItems: TextItem[] = [];

    textContent.items.forEach((item, index) => {
      // Type guard for TextItem (pdf.js can return TextMarkedContent too)
      if (!('str' in item)) return;

      const textItem = item as PDFJSTextItem;

      // Skip empty strings
      if (!textItem.str.trim()) return;

      // Extract font information
      const fontName = textItem.fontName || 'Helvetica';

      // Get transform matrix: [scaleX, skewY, skewX, scaleY, translateX, translateY]
      const transform = textItem.transform;

      // Font size is typically in transform[0] or transform[3]
      const fontSizeX = Math.abs(transform[0]);
      const fontSizeY = Math.abs(transform[3]);
      const fontSize = Math.max(fontSizeX, fontSizeY);

      // Determine font weight and style from font name
      let fontWeight = determineFontWeight(fontName);
      const fontStyle = determineFontStyle(fontName);

      // Additional check: if font name explicitly contains Bold, ensure weight is at least 700
      if (fontName.toLowerCase().includes('bold') && parseInt(fontWeight) < 700) {
        fontWeight = '700';
      }

      // Get position from transform matrix (in PDF coordinates)
      const pdfX = transform[4]; // x position
      const pdfY = transform[5]; // y position (baseline in PDF coords)

      // Get text width (in PDF units)
      const pdfWidth = textItem.width || 0;

      // Transform coordinates to viewport space
      // Note: viewport.convertToViewportPoint handles the bottom-left to top-left conversion
      const [x, yBaseline] = viewport.convertToViewportPoint(pdfX, pdfY);

      // Calculate dimensions in viewport space
      // The viewport already accounts for scale, so we get the actual pixel dimensions
      const scaledFontSize = fontSize * scale;
      const height = scaledFontSize * 1.2;

      // The yBaseline is where the text sits - we need the top of the bounding box
      const y = yBaseline - (scaledFontSize * 0.85);

      // Calculate width
      const [xEnd] = viewport.convertToViewportPoint(pdfX + pdfWidth, pdfY);
      const width = Math.abs(xEnd - x);

      // Use estimated width if too small
      const finalWidth = width > 5 ? width : estimateTextWidth(textItem.str, scaledFontSize);

      // Store the actual pixel size for HTML rendering (already scaled by viewport)
      const displayFontSize = scaledFontSize;

      // Extract color using basic method
      const color = extractColor(textItem);

      // Background color detection happens server-side during export
      const backgroundColor = null;

      textItems.push({
        id: `page-${page.pageNumber}-text-${index}`,
        pageNumber: page.pageNumber,
        str: textItem.str,
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(finalWidth),
        height: Math.round(height),
        fontName,
        fontSize: Math.round(displayFontSize), // Use viewport-scaled size
        fontWeight,
        fontStyle,
        color,
        backgroundColor,
        transform: textItem.transform,
      });
    });

    return textItems;
  } catch (error) {
    console.error('Error extracting text items:', error);
    return [];
  }
}

/**
 * Determine font weight from font name
 */
function determineFontWeight(fontName: string): string {
  const lowerName = fontName.toLowerCase();

  // Check for explicit bold variants in real font names
  if (lowerName.includes('bold')) return '700';
  if (lowerName.includes('heavy') || lowerName.includes('black')) return '900';
  if (lowerName.includes('semibold')) return '600';
  if (lowerName.includes('medium')) return '500';
  if (lowerName.includes('light')) return '300';
  if (lowerName.includes('thin')) return '200';

  // Handle embedded fonts with generic names like g_d0_f1, g_d0_f2, g_d0_f4
  // These are common in PDFs with embedded fonts
  // Typically f1 and f4 variants are bold/primary fonts, f2 are regular/secondary
  if (lowerName.match(/g_d\d+_f1/)) return '700'; // Bold for f1 fonts
  if (lowerName.match(/g_d\d+_f4/)) return '700'; // Bold for f4 fonts (also bold)
  if (lowerName.match(/g_d\d+_f2/)) return '400'; // Regular for f2 fonts
  if (lowerName.match(/g_d\d+_f3/)) return '400'; // Regular for f3 fonts (symbols)

  // For other generic embedded fonts, try to detect from pattern
  if (lowerName.match(/[_-]f1$|[_-]f1[_-]/)) return '700'; // f1 usually bold
  if (lowerName.match(/[_-]f2$|[_-]f2[_-]/)) return '400'; // f2 usually regular

  return '400'; // default to normal weight
}

/**
 * Determine font style from font name
 */
function determineFontStyle(fontName: string): string {
  const lowerName = fontName.toLowerCase();
  if (lowerName.includes('italic') || lowerName.includes('oblique')) return 'italic';
  return 'normal';
}

/**
 * Extract color from text item
 * pdf.js stores color in item properties, but it's not always directly accessible
 */
function extractColor(item: any): string {
  // Try to get fill color if available
  if (item.fillColor) {
    const color = item.fillColor;
    if (Array.isArray(color) && color.length >= 3) {
      // RGB color array [r, g, b] where values are 0-255
      return `rgb(${Math.round(color[0])}, ${Math.round(color[1])}, ${Math.round(color[2])})`;
    }
  }

  // Try strokeColor as fallback
  if (item.strokeColor) {
    const color = item.strokeColor;
    if (Array.isArray(color) && color.length >= 3) {
      return `rgb(${Math.round(color[0])}, ${Math.round(color[1])}, ${Math.round(color[2])})`;
    }
  }

  // Check if it's in the font dict or graphics state
  if (item.color) {
    if (Array.isArray(item.color) && item.color.length >= 3) {
      return `rgb(${Math.round(item.color[0])}, ${Math.round(item.color[1])}, ${Math.round(item.color[2])})`;
    }
  }

  // Default to black if we can't extract color
  return 'rgb(0, 0, 0)';
}

/**
 * Estimate text width based on string length and font size
 * (fallback when width is not available)
 */
function estimateTextWidth(text: string, fontSize: number): number {
  // Rough estimation: average character width is ~0.5-0.6 of font size
  return text.length * fontSize * 0.55;
}

/**
 * Group text items by proximity (for multi-line text detection)
 */
export function groupTextItems(items: TextItem[], threshold: number = 5): TextItem[][] {
  if (items.length === 0) return [];

  const groups: TextItem[][] = [];
  let currentGroup: TextItem[] = [items[0]];

  for (let i = 1; i < items.length; i++) {
    const prev = items[i - 1];
    const curr = items[i];

    // Check if items are on the same line (similar y-coordinate)
    const onSameLine = Math.abs(curr.y - prev.y) < threshold;

    // Check if items are close horizontally
    const horizontallyClose = Math.abs(curr.x - (prev.x + prev.width)) < threshold * 2;

    if (onSameLine && horizontallyClose) {
      currentGroup.push(curr);
    } else {
      groups.push(currentGroup);
      currentGroup = [curr];
    }
  }

  groups.push(currentGroup);
  return groups;
}
