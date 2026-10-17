# PDF Text Editor - Project Context for Claude

## Project Overview
This is a web-based PDF text editor built with Next.js, TypeScript, and Tailwind CSS. It allows users to upload PDF files and edit text in-place while preserving the original styling, formatting, and layout.

**Current Version**: v1.0.0 (Stable, fully working)

## Key Technical Decisions

### Architecture
- **Framework**: Next.js 15 with App Router (TypeScript)
- **PDF Rendering**: pdf.js for canvas rendering
- **PDF Modification**: pdf-lib for exporting modified PDFs
- **Styling**: Tailwind CSS with utility classes
- **State Management**: React hooks (no external state library)

### Critical Implementation Details

#### 1. Background Color Detection (MOST IMPORTANT!)
```typescript
// Sample 3 pixels 5px ABOVE the text (not through it)
const y = Math.floor(item.y - 5); // 5px ABOVE text box
const samples = [
  ctx.getImageData(x1, y, 1, 1).data, // left
  ctx.getImageData(x2, y, 1, 1).data, // center
  ctx.getImageData(x3, y, 1, 1).data, // right
];

// Force very light backgrounds to pure white
const luminance = (0.299 * avgR + 0.587 * avgG + 0.114 * avgB) / 255;
if (luminance > 0.85) {
  avgR = avgG = avgB = 255; // Pure white
}
```
**Why**: Sampling through text picks up anti-aliasing artifacts. Sampling above gets pure background color.

#### 2. Text Color Auto-Detection
```typescript
// Dark backgrounds get white text
const bgLuminance = 0.299 * bgR + 0.587 * bgG + 0.114 * bgB;
const isDarkBackground = bgLuminance < 0.65; // Note: 0.65, not 0.5!
```
**Why**: Threshold of 0.65 ensures medium grays get white text for readability.

#### 3. Bold Font Detection
```typescript
// Embedded fonts use generic names like g_d0_f1, g_d0_f4
if (lowerName.match(/g_d\d+_f1/)) return '700'; // f1 = bold
if (lowerName.match(/g_d\d+_f4/)) return '700'; // f4 = also bold!
if (lowerName.match(/g_d\d+_f2/)) return '400'; // f2 = regular
```
**Why**: PDFs use embedded fonts with cryptic names. f1 and f4 are bold variants.

#### 4. Border Preservation
```typescript
// Make rectangle slightly smaller to preserve cell borders
const rectHeight = pdfHeight - 2;
const rectY = pdfY + 1;
```
**Why**: Full-height rectangles cover table borders. Reducing by 2pt preserves them.

#### 5. Text Alignment Detection
```typescript
// Auto right-align dates, numbers, IDs
const isDatePattern = /\d{1,2}\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*\d{4}/;
const isNumbersOnly = /^\d+(\.\d+)?$/;
const isIDPattern = /^[A-Z]{2}\d+/;

if (shouldRightAlign) {
  textX = pdfX + pdfWidth - newTextWidth; // Flush right
}
```
**Why**: Table cells have different alignments. Dates/numbers are typically right-aligned.

#### 6. Vertical Text Positioning
```typescript
// Add 3pt bottom padding to prevent touching borders
const bottomPadding = 3;
const textY = pdfY + (pdfHeight / 2) - (fontSize / 2) + bottomPadding;
```
**Why**: Perfect centering makes text touch bottom borders. 3pt lift prevents this.

## File Structure & Responsibilities

### Core Components
- **app/page.tsx**: Main orchestrator, state management, PDF upload/save logic
- **components/PDFCanvas.tsx**: Renders PDF pages to canvas (with data-page attribute for sampling)
- **components/TextOverlay.tsx**: Manages text field overlays
- **components/EditableTextField.tsx**: Individual text field with hover/edit states
- **components/Toolbar.tsx**: Sticky top toolbar with Save/Clear buttons
- **components/PreviewModal.tsx**: Preview and filename editor before download

### Core Libraries
- **lib/pdf-renderer.ts**: pdf.js wrapper for loading PDFs
- **lib/text-extraction.ts**: Extracts text with positions, fonts, colors
- **lib/pdf-export.ts**: Modifies PDFs with pdf-lib, applies all the smart logic
- **lib/font-utils.ts**: Maps PDF fonts to web fonts and vice versa
- **lib/canvas-color-detection.ts**: (Created but not used - kept for reference)
- **lib/pdf-color-extraction.ts**: (Attempted operator parsing - too unreliable, not used)

### Types
- **types/pdf.types.ts**: All TypeScript interfaces

## Known Issues & Workarounds

### ArrayBuffer Consumption
**Problem**: pdf.js consumes ArrayBuffer, making it unusable for pdf-lib.
**Solution**: Store `File` object, call `file.arrayBuffer()` fresh each time.

```typescript
const [pdfFile, setPdfFile] = useState<File | null>(null);
// Later:
const freshArrayBuffer = await pdfFile.arrayBuffer();
```

### Canvas "Already in Use" Error
**Problem**: Rendering same canvas multiple times causes conflicts.
**Solution**: Cancel previous render task before starting new one.

```typescript
if (renderTaskRef.current) {
  renderTaskRef.current.cancel();
}
renderTaskRef.current = page.render(renderContext);
```

### Text Wrapping in Tables
**Problem**: Long text like "Amount after due date (7 Jun)" breaks across lines.
**Solution**: Auto-scale font (minimum 70%) instead of wrapping.

```typescript
if (textWidth > pdfWidth) {
  fontSize = originalFontSize * Math.max(0.7, pdfWidth / textWidth);
}
```

## Testing Notes

**Primary Test Document**: Airtel bill PDFs with:
- White table cells with black text
- Dark gray table cells with white text
- Right-aligned dates (e.g., "27 May 2026", "07 Jun 2026")
- Bold headers and normal text
- Table borders that must be preserved

**Key Test Scenarios**:
1. Edit dates in table cells → Should right-align automatically
2. Edit text in dark table cells → Should use white text with gray background
3. Edit text in white cells → Should use black text with white background
4. Edit bold text → Should preserve bold font in output
5. Edit long text → Should auto-scale to fit

## Common Future Enhancement Areas

### If Expanding Features:
1. **Add text alignment toggle** - Let users manually choose left/center/right
2. **Add font size slider** - Allow manual font size adjustment
3. **Add color picker** - Let users change text/background colors manually
4. **Support more fonts** - Embed custom fonts with @pdf-lib/fontkit
5. **Undo/Redo** - Track edit history
6. **Multi-select editing** - Edit multiple text fields at once
7. **Search and replace** - Find and replace text across entire PDF

### If Fixing Edge Cases:
1. **Rotated text** - Currently skipped, could be supported
2. **Vertical text** - Currently not handled
3. **Image-based PDFs** - Would need OCR integration
4. **Very complex layouts** - May need manual coordinate adjustments

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

## Important: What NOT to Change

1. **Don't change the sampling position** (5px above text) - thoroughly tested
2. **Don't change luminance thresholds** (0.85 for white, 0.65 for dark) - calibrated for real PDFs
3. **Don't remove f1/f4 bold detection** - required for embedded fonts
4. **Don't make rectangle full height** - will cover borders
5. **Don't remove bottom padding** - text will touch borders

## Git Workflow

```bash
# This is v1.0.0 baseline
git checkout main  # Stable version

# For new features
git checkout -b feature/your-feature
# ... make changes ...
git commit -m "feat: description"

# If something breaks, revert to v1
git checkout main
```

## Contact & Support

**Original Developer**: Anas Ansari (anasnain on GitHub)
**Built with**: Claude Sonnet 4.5
**Date**: October 2026

## Version History

- **v1.0.0** (Oct 2026): Initial stable release
  - Multi-page editing
  - Smart background/text color detection
  - Bold font preservation
  - Auto right-alignment
  - Border preservation
  - Sticky toolbar
  - Collapsible edits summary
