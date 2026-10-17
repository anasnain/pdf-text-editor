'use client';

interface ToolbarProps {
  fileName?: string;
  pageCount?: number;
  onSave: () => void;
  onClear: () => void;
  isSaving?: boolean;
  hasEdits?: boolean;
}

export default function Toolbar({
  fileName,
  pageCount,
  onSave,
  onClear,
  isSaving = false,
  hasEdits = false,
}: ToolbarProps) {
  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">My PDF Text Editor</h1>
            {fileName && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">{fileName}</span>
                {pageCount && <span className="ml-2">({pageCount} pages)</span>}
              </div>
            )}
          </div>

          {fileName && (
            <div className="flex items-center space-x-3">
              <button
                onClick={onClear}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Clear
              </button>

              <button
                onClick={onSave}
                disabled={isSaving || !hasEdits}
                className={`
                  px-4 py-2 text-sm font-medium text-white rounded-md
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                  transition-colors
                  ${isSaving || !hasEdits
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                  }
                `}
              >
                {isSaving ? 'Saving...' : 'Save PDF'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
