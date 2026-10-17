'use client';

export type EditorMode = 'select' | 'edit-text' | 'add-text';

interface EditorToolbarProps {
  currentMode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
}

export default function EditorToolbar({
  currentMode,
  onModeChange,
}: EditorToolbarProps) {
  const tools = [
    { id: 'select' as EditorMode, label: 'Select', icon: '↖' },
    { id: 'edit-text' as EditorMode, label: 'Edit Text', icon: 'T' },
  ];

  return (
    <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center space-x-1">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onModeChange(tool.id)}
              className={`
                flex flex-col items-center justify-center px-4 py-2 rounded-lg
                transition-all duration-150
                ${
                  currentMode === tool.id
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <span className="text-2xl mb-1">{tool.icon}</span>
              <span className="text-xs font-medium">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
