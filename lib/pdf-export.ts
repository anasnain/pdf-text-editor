import { PDFDocument, rgb } from 'pdf-lib';
import { EditableText } from '@/types/pdf.types';
import { mapToPDFFont, parseColor } from './font-utils';

/**
 * Export a modified PDF with text edits
 */
export async function exportModifiedPDF(
  originalPDFData: ArrayBuffer,
  edits: EditableText[],
  scale: number = 1.5
): Promise<Uint8Array> {
  try {
    console.log(`\n📄 Exporting PDF with ${edits.length} edits at scale ${scale}`);
    edits.forEach((e, i) => {
      console.log(`  ${i + 1}. "${e.str}" → "${e.editedStr}" (font: ${e.fontName}, weight: ${e.fontWeight})`);
    });

    // Load the original PDF
    const pdfDoc = await PDFDocument.load(originalPDFData);
    const pages = pdfDoc.getPages();
    console.log(`PDF loaded: ${pages.length} pages`);

    // Group edits by page number
    const editsByPage = groupEditsByPage(edits);
    console.log('Edits grouped by page:', Object.keys(editsByPage));

    // Process each page with edits
    for (const [pageNumber, pageEdits] of Object.entries(editsByPage)) {
      const pageIndex = parseInt(pageNumber) - 1;
      if (pageIndex < 0 || pageIndex >= pages.length) {
        console.warn(`Invalid page index: ${pageIndex}`);
        continue;
      }

      const page = pages[pageIndex];
      const { height: pageHeight } = page.getSize();
      console.log(`Processing page ${pageNumber}: ${pageEdits.length} edits`);

      // Process each edit on this page
      for (const edit of pageEdits) {
        try {
          await applyTextEdit(pdfDoc, page, edit, pageHeight, scale);
          console.log(`  ✓ Applied: "${edit.editedStr}"`);
        } catch (error) {
          console.error(`  ✗ Failed to apply edit ${edit.id}:`, error);
          // Continue with other edits even if one fails
        }
      }
    }

    // Serialize the PDF
    console.log('\n💾 Saving PDF...');
    const pdfBytes = await pdfDoc.save();
    console.log(`✅ PDF saved successfully: ${(pdfBytes.length / 1024).toFixed(2)} KB\n`);
    return pdfBytes;
  } catch (error) {
    console.error('Error exporting PDF:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to export PDF: ${error.message}`);
    }
    throw new Error('Failed to export modified PDF');
  }
}

/**
 * Apply a single text edit to a PDF page
 */
async function applyTextEdit(
  pdfDoc: PDFDocument,
  page: any,
  edit: EditableText,
  pageHeight: number,
  scale: number
): Promise<void> {
  // Convert coordinates from pdf.js viewport to pdf-lib page coordinates
  // pdf.js uses top-left origin, pdf-lib uses bottom-left origin
  const pdfX = edit.x / scale;
  const pdfY = pageHeight - ((edit.y + edit.height) / scale);
  const pdfWidth = edit.width / scale;
  const pdfHeight = edit.height / scale;

  // Validate coordinates
  if (pdfX < 0 || pdfY < 0 || pdfWidth <= 0 || pdfHeight <= 0) {
    console.warn('Invalid coordinates for edit, skipping:', { pdfX, pdfY, pdfWidth, pdfHeight });
    return;
  }

  // Step 1: Use SAMPLED background color if available, otherwise white
  let bgR = 1, bgG = 1, bgB = 1; // Default white
  let bgSource = 'default-white';

  if (edit.backgroundColor) {
    // Use the sampled background color from canvas
    const bgMatch = edit.backgroundColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (bgMatch) {
      bgR = parseInt(bgMatch[1]) / 255;
      bgG = parseInt(bgMatch[2]) / 255;
      bgB = parseInt(bgMatch[3]) / 255;
      bgSource = `sampled-${edit.backgroundColor}`;
      console.log(`  📦 Using SAMPLED background: ${edit.backgroundColor}`);
    }
  } else {
    console.log(`  📦 Using default WHITE background`);
  }

  // Draw background rectangle slightly smaller to preserve cell borders
  // Reduce height by 2pt and shift up by 1pt to avoid covering bottom border
  const rectHeight = pdfHeight - 2;
  const rectY = pdfY + 1;

  page.drawRectangle({
    x: pdfX,
    y: rectY,
    width: pdfWidth,
    height: rectHeight,
    color: rgb(bgR, bgG, bgB),
    opacity: 1,
  });

  // Step 2: Embed the appropriate font - match the original as closely as possible
  // For embedded fonts like g_d0_f1 or g_d0_f4 (bold), use Helvetica-Bold
  // For embedded fonts like g_d0_f2 (regular), use Helvetica
  let pdfFontName;
  const isBold = edit.fontWeight === '700' || edit.fontWeight === 'bold' || edit.fontName.includes('f1') || edit.fontName.includes('f4');

  if (isBold) {
    pdfFontName = edit.fontStyle === 'italic' ? 'Helvetica-BoldOblique' : 'Helvetica-Bold';
    console.log(`  🔤 Bold font detected: fontWeight="${edit.fontWeight}", fontName="${edit.fontName}" → ${pdfFontName}`);
  } else if (edit.fontStyle === 'italic') {
    pdfFontName = 'Helvetica-Oblique';
  } else {
    pdfFontName = 'Helvetica';
    console.log(`  🔤 Regular font: fontWeight="${edit.fontWeight}", fontName="${edit.fontName}" → ${pdfFontName}`);
  }

  const font = await pdfDoc.embedFont(pdfFontName);

  // Step 3: Calculate font size to match original
  const originalFontSize = Math.max(4, Math.min(72, edit.fontSize / scale));

  // Step 4: Calculate if text fits - if not, scale font down
  const textWidth = font.widthOfTextAtSize(edit.editedStr, originalFontSize);
  let fontSize = originalFontSize;

  // If text is too wide, scale font down to fit (minimum 70% of original size)
  if (textWidth > pdfWidth) {
    const scaleFactor = Math.max(0.7, pdfWidth / textWidth);
    fontSize = originalFontSize * scaleFactor;
    console.log(`  📏 Text too wide, scaling font: ${originalFontSize.toFixed(1)}pt → ${fontSize.toFixed(1)}pt`);
  }

  // Step 5: Text color - WHITE for dark backgrounds, BLACK for light backgrounds
  let r, g, b;

  // Calculate background luminance to determine if we need white or black text
  const bgLuminance = 0.299 * bgR + 0.587 * bgG + 0.114 * bgB;
  // Use higher threshold (0.65) so medium grays get white text
  const isDarkBackground = bgLuminance < 0.65;

  if (isDarkBackground) {
    [r, g, b] = [1, 1, 1]; // White text for dark backgrounds
    console.log(`  🎨 Text: "${edit.editedStr}" | Color: WHITE (dark bg, luminance=${bgLuminance.toFixed(2)})`);
  } else {
    [r, g, b] = parseColor(edit.color);
    console.log(`  🎨 Text: "${edit.editedStr}" | Color: ${edit.color} (light bg, luminance=${bgLuminance.toFixed(2)})`);
  }

  // Step 6: Keep text as single line - NO WRAPPING
  // The font is already auto-scaled to fit, so wrapping should never be needed
  const lines = [edit.editedStr];

  // Step 7: Detect text alignment and adjust X position
  const newTextWidth = font.widthOfTextAtSize(edit.editedStr, fontSize);

  // Detect if text should be right-aligned
  // Common patterns: dates, numbers, IDs in table cells
  const trimmedText = edit.editedStr.trim();
  const isDatePattern = /\d{1,2}\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*\d{4}/.test(trimmedText);
  const isNumbersOnly = /^\d+(\.\d+)?$/.test(trimmedText);
  const isIDPattern = /^[A-Z]{2}\d+/.test(trimmedText); // Like "HF271..."

  // Right-align if it's a date, number, or ID (no width restriction)
  const shouldRightAlign = isDatePattern || isNumbersOnly || isIDPattern;

  console.log(`  🔍 Alignment check for "${trimmedText}": date=${isDatePattern}, number=${isNumbersOnly}, ID=${isIDPattern}, willRightAlign=${shouldRightAlign}`);

  let textX = pdfX;
  if (shouldRightAlign) {
    // Right-align: position text so it ends exactly at the right edge (no padding)
    textX = pdfX + pdfWidth - newTextWidth;
    console.log(`  ↔️  Right-aligned: "${edit.editedStr}" (flush right)`);
  }

  // Position text vertically with padding from bottom
  // Add 3pt padding from bottom to prevent touching cell borders
  const bottomPadding = 3;
  const textY = pdfY + (pdfHeight / 2) - (fontSize / 2) + bottomPadding;

  if (edit.editedStr && edit.editedStr.trim().length > 0) {
    try {
      page.drawText(edit.editedStr, {
        x: textX,
        y: textY,
        size: fontSize,
        font: font,
        color: rgb(r, g, b),
      });
    } catch (error) {
      console.error('Error drawing text:', edit.editedStr, error);
    }
  }
}

/**
 * Wrap text to fit within a given width
 * Only used when text is extremely long
 */
function wrapText(
  text: string,
  font: any,
  fontSize: number,
  maxWidth: number
): string[] {
  // Don't split on spaces if text contains brackets or special formatting
  // This prevents "Amount after due date (7 Jun)" from being split incorrectly
  const hasSpecialChars = /[()[\]{}]/.test(text);

  if (hasSpecialChars || text.split(' ').length <= 3) {
    // Keep short text or text with parentheses as single line
    return [text];
  }

  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [text];
}

/**
 * Group edits by page number
 */
function groupEditsByPage(edits: EditableText[]): Record<number, EditableText[]> {
  const grouped: Record<number, EditableText[]> = {};

  edits.forEach((edit) => {
    if (!grouped[edit.pageNumber]) {
      grouped[edit.pageNumber] = [];
    }
    grouped[edit.pageNumber].push(edit);
  });

  return grouped;
}

/**
 * Create a blob URL for PDF preview
 */
export function createPDFBlobURL(pdfBytes: Uint8Array): string {
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}

/**
 * Download a PDF file
 */
export function downloadPDF(pdfBytes: Uint8Array, fileName: string): void {
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
