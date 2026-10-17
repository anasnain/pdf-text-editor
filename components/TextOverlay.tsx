'use client';

import { useState, useCallback } from 'react';
import { EditableText } from '@/types/pdf.types';
import EditableTextField from './EditableTextField';

interface TextOverlayProps {
  textItems: EditableText[];
  pageNumber: number;
  scale: number;
  canvasWidth: number;
  canvasHeight: number;
  onTextEdit: (id: string, newText: string) => void;
}

export default function TextOverlay({
  textItems,
  pageNumber,
  scale,
  canvasWidth,
  canvasHeight,
  onTextEdit,
}: TextOverlayProps) {
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);

  const handleActivate = useCallback((id: string) => {
    setActiveFieldId(id);
  }, []);

  const handleDeactivate = useCallback(() => {
    setActiveFieldId(null);
  }, []);

  const handleEdit = useCallback((id: string, newText: string) => {
    onTextEdit(id, newText);
  }, [onTextEdit]);

  // Filter text items for this page
  const pageTextItems = textItems.filter(item => item.pageNumber === pageNumber);

  return (
    <div
      className="absolute top-0 left-0 pointer-events-none"
      style={{
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`,
      }}
    >
      {pageTextItems.map((textItem) => (
        <EditableTextField
          key={textItem.id}
          textItem={textItem}
          isActive={activeFieldId === textItem.id}
          onEdit={handleEdit}
          onDeactivate={handleDeactivate}
          onActivate={() => handleActivate(textItem.id)}
          scale={scale}
        />
      ))}
    </div>
  );
}
