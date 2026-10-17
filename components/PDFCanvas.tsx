'use client';

import { useEffect, useRef } from 'react';
import { PDFPageProxy } from '@/types/pdf.types';

interface PDFCanvasProps {
  page: PDFPageProxy;
  pageNumber: number;
  scale: number;
  onRendered?: () => void;
}

export default function PDFCanvas({ page, pageNumber, scale, onRendered }: PDFCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current || !page) return;

    const canvas = canvasRef.current;
    let isMounted = true;

    async function render() {
      try {
        // Cancel any ongoing render task
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        // Get viewport and setup canvas with high quality settings
        const viewport = page.getViewport({ scale });
        const context = canvas.getContext('2d', {
          alpha: false,
          desynchronized: false
        });

        if (!context) {
          throw new Error('Failed to get canvas 2D context');
        }

        // Set canvas dimensions
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Enable image smoothing for better quality
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';

        // Start new render task
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        renderTaskRef.current = page.render(renderContext);
        await renderTaskRef.current.promise;

        if (isMounted) {
          onRendered?.();
        }
      } catch (error: any) {
        // Ignore cancellation errors
        if (error?.name === 'RenderingCancelledException') {
          return;
        }
        console.error(`Error rendering page ${pageNumber}:`, error);
      } finally {
        renderTaskRef.current = null;
      }
    }

    render();

    // Cleanup function
    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [page, pageNumber, scale, onRendered]);

  return (
    <canvas
      ref={canvasRef}
      data-page={pageNumber}
      className="shadow-lg"
      style={{
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    />
  );
}
