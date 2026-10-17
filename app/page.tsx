'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import FileUploader from '@/components/FileUploader';
import PDFCanvas from '@/components/PDFCanvas';
import TextOverlay from '@/components/TextOverlay';
import Toolbar from '@/components/Toolbar';
import { EditorMode } from '@/components/EditorToolbar';
import PreviewModal from '@/components/PreviewModal';
import { loadPDF } from '@/lib/pdf-renderer';
import { extractTextItems } from '@/lib/text-extraction';
import { exportModifiedPDF, createPDFBlobURL, downloadPDF } from '@/lib/pdf-export';
import { PDFDocumentProxy, PDFPageProxy, EditableText, PDFMetadata } from '@/types/pdf.types';

export default function Home() {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null); // Store File instead of ArrayBuffer
  const [pages, setPages] = useState<PDFPageProxy[]>([]);
  const [metadata, setMetadata] = useState<PDFMetadata | null>(null);
  const [textItems, setTextItems] = useState<EditableText[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [scale] = useState(2.0); // Higher scale for better quality
  const [editorMode, setEditorMode] = useState<EditorMode>('edit-text'); // Edit mode enabled by default
  const [showEditsList, setShowEditsList] = useState(false); // Collapsible edits list

  const containerRef = useRef<HTMLDivElement>(null);

  const hasEdits = textItems.some(item => item.isEdited);

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File, arrayBuffer: ArrayBuffer) => {
    setIsLoading(true);
    try {
      // Store the file for later use when exporting
      setPdfFile(file);

      // Load PDF document
      const pdf = await loadPDF(arrayBuffer);
      setPdfDoc(pdf);

      // Set metadata
      setMetadata({
        numPages: pdf.numPages,
        fileName: file.name,
        fileSize: file.size,
      });

      // Load all pages
      const loadedPages: PDFPageProxy[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        loadedPages.push(page);
      }
      setPages(loadedPages);

      // Extract text from all pages
      const allTextItems: EditableText[] = [];
      for (const page of loadedPages) {
        const pageTextItems = await extractTextItems(page, scale);
        const editableItems: EditableText[] = pageTextItems.map(item => ({
          ...item,
          editedStr: item.str,
          isEdited: false,
        }));
        allTextItems.push(...editableItems);
      }
      setTextItems(allTextItems);

    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Failed to load PDF. Please try another file.');
    } finally {
      setIsLoading(false);
    }
  }, [scale]);

  // Handle text editing
  const handleTextEdit = useCallback((id: string, newText: string) => {
    setTextItems(prev => {
      const updated = prev.map(item =>
        item.id === id
          ? { ...item, editedStr: newText, isEdited: newText !== item.str }
          : item
      );

      // Log the edit
      const editedItem = updated.find(item => item.id === id);
      if (editedItem && editedItem.isEdited) {
        console.log(`✏️ Edit: "${editedItem.str}" → "${editedItem.editedStr}"`);
      }

      return updated;
    });
  }, []);

  // Handle save button click
  const handleSave = useCallback(async () => {
    if (!pdfFile || !hasEdits) return;

    setIsSaving(true);
    try {
      // Get only edited items
      let editedItems = textItems.filter(item => item.isEdited);
      console.log(`\n🔄 Starting PDF export with ${editedItems.length} edits...`);

      // Sample background colors from canvas for each edited item
      editedItems = editedItems.map(item => {
        const canvas = document.querySelector(`canvas[data-page="${item.pageNumber}"]`) as HTMLCanvasElement;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            try {
              // Sample 3 points behind the text (left, center, right)
              // Sample from slightly above the text (where the solid background is, not text edges)
              const x1 = Math.floor(item.x + item.width * 0.2);
              const x2 = Math.floor(item.x + item.width * 0.5);
              const x3 = Math.floor(item.x + item.width * 0.8);
              const y = Math.floor(item.y - 5); // Sample 5px ABOVE the text box

              const samples = [
                ctx.getImageData(x1, y, 1, 1).data,
                ctx.getImageData(x2, y, 1, 1).data,
                ctx.getImageData(x3, y, 1, 1).data,
              ];

              // Average the RGB values
              let avgR = Math.round((samples[0][0] + samples[1][0] + samples[2][0]) / 3);
              let avgG = Math.round((samples[0][1] + samples[1][1] + samples[2][1]) / 3);
              let avgB = Math.round((samples[0][2] + samples[1][2] + samples[2][2]) / 3);

              // If sampled color is very light (almost white), force to pure white
              // This prevents border/shadow artifacts from making white cells appear gray
              const luminance = (0.299 * avgR + 0.587 * avgG + 0.114 * avgB) / 255;
              if (luminance > 0.85) {
                avgR = avgG = avgB = 255; // Pure white
                console.log(`  🎨 Sampled background for "${item.str}": rgb(${avgR}, ${avgG}, ${avgB}) [light background, forced to white]`);
              } else {
                console.log(`  🎨 Sampled background for "${item.str}": rgb(${avgR}, ${avgG}, ${avgB}) [luminance=${luminance.toFixed(2)}]`);
              }

              return { ...item, backgroundColor: `rgb(${avgR}, ${avgG}, ${avgB})` };
            } catch (e) {
              console.warn(`  ⚠️ Failed to sample background for "${item.str}"`);
            }
          }
        }
        return item;
      });

      // Read file as fresh ArrayBuffer for export
      const freshArrayBuffer = await pdfFile.arrayBuffer();

      // Export modified PDF
      const pdfBytes = await exportModifiedPDF(freshArrayBuffer, editedItems, scale);

      // Create blob URL for preview
      const blobURL = createPDFBlobURL(pdfBytes);
      setPreviewURL(blobURL);
      setShowPreview(true);

    } catch (error) {
      console.error('Error saving PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to save PDF: ${errorMessage}\n\nCheck the browser console for more details.`);
    } finally {
      setIsSaving(false);
    }
  }, [pdfFile, textItems, hasEdits, scale]);

  // Handle preview confirm (download)
  const handlePreviewConfirm = useCallback(async (fileName: string) => {
    if (!pdfFile) return;

    try {
      // Get edited items with sampled background colors (same as handleSave)
      let editedItems = textItems.filter(item => item.isEdited);

      // Sample background colors from canvas
      editedItems = editedItems.map(item => {
        const canvas = document.querySelector(`canvas[data-page="${item.pageNumber}"]`) as HTMLCanvasElement;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            try {
              // Sample from slightly above the text (where the solid background is, not text edges)
              const x1 = Math.floor(item.x + item.width * 0.2);
              const x2 = Math.floor(item.x + item.width * 0.5);
              const x3 = Math.floor(item.x + item.width * 0.8);
              const y = Math.floor(item.y - 5); // Sample 5px ABOVE the text box

              const samples = [
                ctx.getImageData(x1, y, 1, 1).data,
                ctx.getImageData(x2, y, 1, 1).data,
                ctx.getImageData(x3, y, 1, 1).data,
              ];

              // Average the RGB values
              let avgR = Math.round((samples[0][0] + samples[1][0] + samples[2][0]) / 3);
              let avgG = Math.round((samples[0][1] + samples[1][1] + samples[2][1]) / 3);
              let avgB = Math.round((samples[0][2] + samples[1][2] + samples[2][2]) / 3);

              // If sampled color is very light (almost white), force to pure white
              // This prevents border/shadow artifacts from making white cells appear gray
              const luminance = (0.299 * avgR + 0.587 * avgG + 0.114 * avgB) / 255;
              if (luminance > 0.85) {
                avgR = avgG = avgB = 255; // Pure white
                console.log(`  🎨 Sampled background for "${item.str}": rgb(${avgR}, ${avgG}, ${avgB}) [light background, forced to white]`);
              } else {
                console.log(`  🎨 Sampled background for "${item.str}": rgb(${avgR}, ${avgG}, ${avgB}) [luminance=${luminance.toFixed(2)}]`);
              }

              return { ...item, backgroundColor: `rgb(${avgR}, ${avgG}, ${avgB})` };
            } catch (e) {
              // Ignore sampling errors
            }
          }
        }
        return item;
      });

      // Read file as fresh ArrayBuffer
      const freshArrayBuffer = await pdfFile.arrayBuffer();
      const pdfBytes = await exportModifiedPDF(freshArrayBuffer, editedItems, scale);
      downloadPDF(pdfBytes, fileName);

      setShowPreview(false);
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
      }
      setPreviewURL(null);

    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  }, [pdfFile, textItems, scale, previewURL]);

  // Handle preview close
  const handlePreviewClose = useCallback(() => {
    setShowPreview(false);
    if (previewURL) {
      URL.revokeObjectURL(previewURL);
    }
    setPreviewURL(null);
  }, [previewURL]);

  // Handle clear
  const handleClear = useCallback(() => {
    if (confirm('Are you sure you want to clear and start over?')) {
      setPdfDoc(null);
      setPdfFile(null);
      setPages([]);
      setMetadata(null);
      setTextItems([]);
      setPreviewURL(null);
      setShowPreview(false);
    }
  }, []);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
      }
    };
  }, [previewURL]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Toolbar
        fileName={metadata?.fileName}
        pageCount={metadata?.numPages}
        onSave={handleSave}
        onClear={handleClear}
        isSaving={isSaving}
        hasEdits={hasEdits}
      />

      {/* EditorToolbar removed - edit mode is always active */}

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          {!pdfDoc ? (
            <FileUploader onFileSelect={handleFileSelect} />
          ) : isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading PDF...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Edit instructions */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>📝 Edit Mode:</strong> Click any text to edit.
                  Edited text shows with <span className="text-green-600">green border ✓</span>.
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  💡 <strong>Tip:</strong> Keep edited text similar length to original to avoid old text showing through.
                </p>
              </div>

              {/* Show edit summary if there are edits */}
              {hasEdits && (
                <div className="bg-green-50 border border-green-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setShowEditsList(!showEditsList)}
                    className="w-full px-4 py-3 text-left hover:bg-green-100 transition-colors"
                  >
                    <h3 className="text-sm font-bold text-green-800 flex items-center justify-between">
                      <span>✅ Edits Made ({textItems.filter(item => item.isEdited).length})</span>
                      <span className="text-green-600">{showEditsList ? '▲' : '▼'}</span>
                    </h3>
                  </button>
                  {showEditsList && (
                    <div className="px-4 pb-4 space-y-1 max-h-48 overflow-y-auto">
                      {textItems.filter(item => item.isEdited).map((item) => (
                        <div key={item.id} className="text-xs text-green-700 bg-white px-2 py-1 rounded">
                          <span className="font-medium">"{item.str}"</span>
                          <span className="mx-1">→</span>
                          <span className="font-medium text-green-600">"{item.editedStr}"</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div ref={containerRef} className="space-y-8">
                {pages.map((page, index) => {
                  const pageNumber = index + 1;
                  const viewport = page.getViewport({ scale });

                  return (
                    <div key={pageNumber} className="bg-white rounded-lg shadow-lg p-4">
                      <div className="mb-2 text-sm text-gray-600 font-medium">
                        Page {pageNumber} of {metadata?.numPages}
                      </div>
                      <div
                        className="relative"
                        style={{
                          width: viewport.width,
                          height: viewport.height,
                          cursor: 'text',
                        }}
                      >
                        <PDFCanvas
                          page={page}
                          pageNumber={pageNumber}
                          scale={scale}
                          onRendered={() => {
                            // Store canvas ref for color sampling
                            const canvas = document.querySelector(`canvas[data-page="${pageNumber}"]`) as HTMLCanvasElement;
                            if (canvas) {
                              (window as any)[`pdfCanvas_${pageNumber}`] = canvas;
                            }
                          }}
                        />
                        <TextOverlay
                          textItems={textItems}
                          pageNumber={pageNumber}
                          scale={scale}
                          canvasWidth={viewport.width}
                          canvasHeight={viewport.height}
                          onTextEdit={handleTextEdit}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <PreviewModal
        isOpen={showPreview}
        pdfBlobURL={previewURL}
        originalFileName={metadata?.fileName || 'document.pdf'}
        onClose={handlePreviewClose}
        onConfirm={handlePreviewConfirm}
      />
    </div>
  );
}
