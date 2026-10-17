import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocumentProxy, PDFPageProxy } from '@/types/pdf.types';

// Configure pdf.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
}

/**
 * Load a PDF document from an ArrayBuffer
 */
export async function loadPDF(fileData: ArrayBuffer): Promise<PDFDocumentProxy> {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: fileData });
    const pdf = await loadingTask.promise;
    return pdf;
  } catch (error) {
    console.error('Error loading PDF:', error);
    throw new Error('Failed to load PDF document');
  }
}

/**
 * Render a single PDF page to a canvas element
 */
export async function renderPage(
  page: PDFPageProxy,
  canvas: HTMLCanvasElement,
  scale: number = 1.5
): Promise<void> {
  const viewport = page.getViewport({ scale });
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Failed to get canvas 2D context');
  }

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };

  try {
    await page.render(renderContext).promise;
  } catch (error) {
    console.error('Error rendering page:', error);
    throw new Error('Failed to render PDF page');
  }
}

/**
 * Get the optimal scale for rendering based on container width
 */
export function getOptimalScale(
  pageWidth: number,
  containerWidth: number,
  maxScale: number = 2.0
): number {
  const scale = containerWidth / pageWidth;
  return Math.min(scale, maxScale);
}

/**
 * Calculate page dimensions for a given scale
 */
export function getPageDimensions(
  page: PDFPageProxy,
  scale: number
): { width: number; height: number } {
  const viewport = page.getViewport({ scale });
  return {
    width: viewport.width,
    height: viewport.height,
  };
}
