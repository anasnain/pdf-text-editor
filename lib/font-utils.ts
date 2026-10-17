import { StandardFonts } from 'pdf-lib';
import { FontMapping } from '@/types/pdf.types';

/**
 * Map a PDF font name to a web-safe font for HTML overlay
 */
export function mapToWebFont(pdfFontName: string): string {
  const lowerName = pdfFontName.toLowerCase();

  // Helvetica/Arial family
  if (lowerName.includes('helvetica') || lowerName.includes('arial') || lowerName.includes('sans')) {
    return '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif';
  }

  // Times family
  if (lowerName.includes('times') || lowerName.includes('roman') || lowerName.includes('serif')) {
    return 'Georgia, "Times New Roman", Times, serif';
  }

  // Courier family (monospace)
  if (lowerName.includes('courier') || lowerName.includes('mono') || lowerName.includes('consolas')) {
    return '"Courier New", Courier, "Lucida Console", monospace';
  }

  // Calibri
  if (lowerName.includes('calibri')) {
    return 'Calibri, "Segoe UI", Arial, sans-serif';
  }

  // Verdana
  if (lowerName.includes('verdana')) {
    return 'Verdana, Geneva, sans-serif';
  }

  // Default to system sans-serif
  return '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
}

/**
 * Map a font name and style to a standard PDF font for export
 */
export function mapToPDFFont(
  fontName: string,
  weight: string,
  style: string
): string {
  const lowerName = fontName.toLowerCase();
  const isBold = weight === 'bold' || weight === '600' || weight === '700' || weight === '900';
  const isItalic = style === 'italic' || style === 'oblique';

  // Helvetica family
  if (lowerName.includes('helvetica') || lowerName.includes('arial') || lowerName.includes('sans')) {
    if (isBold && isItalic) return StandardFonts.HelveticaBoldOblique;
    if (isBold) return StandardFonts.HelveticaBold;
    if (isItalic) return StandardFonts.HelveticaOblique;
    return StandardFonts.Helvetica;
  }

  // Times family
  if (lowerName.includes('times') || lowerName.includes('serif')) {
    if (isBold && isItalic) return StandardFonts.TimesRomanBoldItalic;
    if (isBold) return StandardFonts.TimesRomanBold;
    if (isItalic) return StandardFonts.TimesRomanItalic;
    return StandardFonts.TimesRoman;
  }

  // Courier family
  if (lowerName.includes('courier') || lowerName.includes('mono')) {
    if (isBold && isItalic) return StandardFonts.CourierBoldOblique;
    if (isBold) return StandardFonts.CourierBold;
    if (isItalic) return StandardFonts.CourierOblique;
    return StandardFonts.Courier;
  }

  // Default fallback
  return StandardFonts.Helvetica;
}

/**
 * Get complete font mapping for a text item
 */
export function getFontMapping(
  fontName: string,
  weight: string,
  style: string
): FontMapping {
  return {
    webFont: mapToWebFont(fontName),
    pdfFont: mapToPDFFont(fontName, weight, style),
    weight,
    style,
  };
}

/**
 * Parse RGB color string to RGB array
 */
export function parseColor(colorString: string): [number, number, number] {
  // Handle rgb() format
  const rgbMatch = colorString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    return [
      parseInt(rgbMatch[1]) / 255,
      parseInt(rgbMatch[2]) / 255,
      parseInt(rgbMatch[3]) / 255,
    ];
  }

  // Handle hex format
  const hexMatch = colorString.match(/^#([0-9a-f]{6})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    return [
      parseInt(hex.substr(0, 2), 16) / 255,
      parseInt(hex.substr(2, 2), 16) / 255,
      parseInt(hex.substr(4, 2), 16) / 255,
    ];
  }

  // Default to black
  return [0, 0, 0];
}

/**
 * Convert font size from pixels to points
 */
export function pxToPt(px: number): number {
  return px * 0.75;
}

/**
 * Convert font size from points to pixels
 */
export function ptToPx(pt: number): number {
  return pt * 1.333;
}
