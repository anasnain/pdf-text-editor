'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { EditableText } from '@/types/pdf.types';
import { mapToWebFont } from '@/lib/font-utils';

interface EditableTextFieldProps {
  textItem: EditableText;
  isActive: boolean;
  onEdit: (id: string, newText: string) => void;
  onDeactivate: () => void;
  onActivate: () => void;
  scale: number;
}

export default function EditableTextField({
  textItem,
  isActive,
  onEdit,
  onDeactivate,
  onActivate,
  scale,
}: EditableTextFieldProps) {
  const [localValue, setLocalValue] = useState(textItem.editedStr);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Update local value when textItem changes
  useEffect(() => {
    setLocalValue(textItem.editedStr);
  }, [textItem.editedStr]);

  // Focus textarea when activated
  useEffect(() => {
    if (isActive && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isActive]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onEdit(textItem.id, newValue);
  }, [textItem.id, onEdit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      onDeactivate();
    }
    // Allow Enter for multi-line text
  }, [onDeactivate]);

  // Map PDF font to web font
  const webFont = mapToWebFont(textItem.fontName);

  // Show edited text after editing - user needs to see their changes
  const showEditedText = textItem.isEdited && !isActive;

  // Ensure font weight is a valid CSS value
  const cssFontWeight = textItem.fontWeight === 'normal' ? '400' :
                        textItem.fontWeight === 'bold' ? '700' :
                        textItem.fontWeight;

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${textItem.x}px`,
    top: `${textItem.y}px`,
    width: `${textItem.width}px`,
    minHeight: `${textItem.height}px`,
    fontFamily: webFont,
    fontSize: `${textItem.fontSize}px`,
    fontWeight: cssFontWeight,
    fontStyle: textItem.fontStyle,
    color: isActive || showEditedText ? textItem.color : 'transparent',
    lineHeight: '1.15',
    padding: '2px 4px',
    margin: 0,
    border: isActive ? '2px solid #3b82f6' : showEditedText ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid transparent',
    background: isActive ? '#ffffff' : showEditedText ? 'rgba(255, 255, 255, 0.98)' : 'transparent',
    outline: 'none',
    resize: 'none',
    overflow: 'visible',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: isActive ? '0 4px 12px rgba(59, 130, 246, 0.25)' : showEditedText ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
    borderRadius: '2px',
    zIndex: isActive ? 50 : showEditedText ? 30 : 10,
    letterSpacing: 'normal',
    textRendering: 'optimizeLegibility',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
  };

  // Styling for edited text
  if (showEditedText) {
    style.background = 'rgba(255, 255, 255, 0.98)';
    style.border = '1px solid rgba(34, 197, 94, 0.4)';
    style.color = textItem.color;
    style.fontWeight = cssFontWeight; // Ensure font weight is applied
  }

  // Hover effect
  if (isHovered && !isActive) {
    if (showEditedText) {
      style.border = '1px solid rgba(34, 197, 94, 0.7)';
      style.background = 'rgba(255, 255, 255, 1)';
    } else {
      style.background = 'rgba(59, 130, 246, 0.12)';
      style.border = '1px solid rgba(59, 130, 246, 0.5)';
    }
  }

  if (isActive) {
    return (
      <textarea
        ref={textareaRef}
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={onDeactivate}
        style={{
          ...style,
          fontWeight: cssFontWeight,
        }}
        className="whitespace-pre-wrap"
      />
    );
  }

  // Non-active: show edited text with styling that approximates the original
  return (
    <div
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onActivate();
      }}
      title={showEditedText ? `Edited: "${localValue}" (click to edit again)` : "Click to edit"}
      className="whitespace-pre-wrap pointer-events-auto"
    >
      {showEditedText ? (
        <>
          {localValue}
          <span style={{
            fontSize: '10px',
            color: '#16a34a',
            marginLeft: '4px',
            verticalAlign: 'super'
          }}>✓</span>
        </>
      ) : ''}
    </div>
  );
}
