import { PDFDocumentProxy, PDFPageProxy, TextItem as PDFJSTextItem } from 'pdfjs-dist/types/src/display/api';

// Extended text item with position and styling information
export interface TextItem {
  id: string;
  pageNumber: number;
  str: string; // Original text content
  x: number; // X position (top-left corner)
  y: number; // Y position (top-left corner)
  width: number; // Bounding box width
  height: number; // Bounding box height
  fontName: string; // Font family name
  fontSize: number; // Font size in points
  fontWeight: string; // normal, bold, etc.
  fontStyle: string; // normal, italic, oblique
  color: string; // RGB or RGBA color string
  backgroundColor: string | null; // Background color if detected (table cells, highlights)
  transform: number[]; // Transformation matrix from pdf.js
}

// Editable text with user modifications
export interface EditableText extends TextItem {
  editedStr: string; // Modified text content
  isEdited: boolean; // Whether this text has been modified
  isTableCell?: boolean; // User-marked as table cell text
  userBackgroundColor?: string; // User-specified background color override
}

// PDF document metadata
export interface PDFMetadata {
  numPages: number;
  fileName: string;
  fileSize: number;
  title?: string;
  author?: string;
}

// Page rendering information
export interface PageRenderInfo {
  pageNumber: number;
  width: number;
  height: number;
  scale: number;
  canvas: HTMLCanvasElement;
}

// Font mapping for PDF export
export interface FontMapping {
  webFont: string; // Font used in HTML overlay
  pdfFont: string; // Standard PDF font for export
  weight: string; // Font weight
  style: string; // Font style
}

// Export configuration
export interface ExportConfig {
  fileName: string;
  includeMetadata: boolean;
}

// PDF.js types re-export for convenience
export type { PDFDocumentProxy, PDFPageProxy, PDFJSTextItem };
