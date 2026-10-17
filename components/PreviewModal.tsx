'use client';

import { useState, useEffect } from 'react';

interface PreviewModalProps {
  isOpen: boolean;
  pdfBlobURL: string | null;
  originalFileName: string;
  onClose: () => void;
  onConfirm: (fileName: string) => void;
}

export default function PreviewModal({
  isOpen,
  pdfBlobURL,
  originalFileName,
  onClose,
  onConfirm,
}: PreviewModalProps) {
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    if (isOpen && originalFileName) {
      // Remove .pdf extension and add _edited
      const baseName = originalFileName.replace(/\.pdf$/i, '');
      setFileName(`${baseName}_edited.pdf`);
    }
  }, [isOpen, originalFileName]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (fileName.trim()) {
      // Ensure .pdf extension
      const finalFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
      onConfirm(finalFileName);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Preview Modified PDF
                </h3>

                {/* PDF Preview */}
                <div className="mb-4 border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                  {pdfBlobURL ? (
                    <iframe
                      src={pdfBlobURL}
                      className="w-full h-96"
                      title="PDF Preview"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-96">
                      <div className="text-gray-500">Loading preview...</div>
                    </div>
                  )}
                </div>

                {/* File name input */}
                <div className="mb-4">
                  <label htmlFor="fileName" className="block text-sm font-medium text-gray-700 mb-2">
                    File Name
                  </label>
                  <input
                    id="fileName"
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter file name"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!fileName.trim()}
              className={`
                w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                sm:ml-3 sm:w-auto sm:text-sm transition-colors
                ${fileName.trim()
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 cursor-not-allowed'
                }
              `}
            >
              Download
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
