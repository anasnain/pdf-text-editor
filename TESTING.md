# Testing Guide for PDF Text Editor

## Quick Testing Checklist

### ✅ Phase 1: File Upload

- [ ] **Drag & Drop Upload**
  - Drag a PDF file onto the upload area
  - Verify upload area highlights during drag
  - Confirm PDF loads successfully

- [ ] **File Picker Upload**
  - Click the upload area
  - Select a PDF from file picker
  - Verify PDF loads successfully

- [ ] **Error Handling**
  - Try uploading a non-PDF file (should show error)
  - Try uploading a corrupted PDF (should handle gracefully)

### ✅ Phase 2: PDF Rendering

- [ ] **Single Page PDF**
  - Upload a 1-page PDF
  - Verify page renders clearly
  - Check page number display

- [ ] **Multi-Page PDF**
  - Upload a 3+ page PDF
  - Verify all pages render in scrollable layout
  - Check page numbers are correct
  - Test scrolling between pages

- [ ] **Visual Quality**
  - Verify text is sharp and readable
  - Check images/graphics render correctly
  - Confirm no visual artifacts

### ✅ Phase 3: Text Selection & Editing

- [ ] **Click to Edit**
  - Click on various text elements
  - Verify editable field appears
  - Check field is positioned correctly over text

- [ ] **Hover Effect**
  - Hover over text elements
  - Verify subtle highlight appears
  - Confirm cursor changes to pointer

- [ ] **Font Matching**
  - Select different text styles (bold, italic, normal)
  - Open browser DevTools (right-click → Inspect)
  - Verify computed font styles match original

- [ ] **Text Editing**
  - Edit single-line text
  - Edit multi-line text blocks
  - Type special characters (!@#$%^&*)
  - Test numbers and dates

- [ ] **Edit Completion**
  - Click outside text field to finish
  - Press ESC key to cancel
  - Verify changes are saved

### ✅ Phase 4: Multiple Edits

- [ ] Make edits across multiple pages
- [ ] Edit multiple text blocks on same page
- [ ] Mix of single-line and multi-line edits
- [ ] Verify all edits persist correctly

### ✅ Phase 5: Toolbar Functionality

- [ ] **Save Button**
  - Verify disabled when no edits made
  - Verify enabled after making edits
  - Check "Saving..." state appears

- [ ] **Clear Button**
  - Click Clear button
  - Confirm confirmation dialog appears
  - Verify page resets to upload screen

- [ ] **File Info Display**
  - Verify filename shows in toolbar
  - Check page count is correct

### ✅ Phase 6: Preview Modal

- [ ] **Modal Opening**
  - Click "Save PDF" button
  - Verify preview modal appears
  - Check PDF preview loads in iframe

- [ ] **Filename Editing**
  - Verify default filename ends with "_edited"
  - Edit filename
  - Confirm changes are saved

- [ ] **Modal Actions**
  - Test Cancel button (should close without download)
  - Test Download button (should trigger download)
  - Test clicking outside modal (should close)

### ✅ Phase 7: PDF Export & Download

- [ ] **Download Functionality**
  - Click Download in preview modal
  - Verify file downloads to browser
  - Check filename matches input

- [ ] **PDF Verification**
  - Open downloaded PDF in Adobe Reader / Preview
  - Verify all edits are present
  - Check text positioning is correct
  - Confirm original text is covered cleanly
  - Verify background graphics intact

- [ ] **Font Rendering**
  - Check fonts render reasonably well
  - Verify sizes match approximately
  - Confirm colors are preserved

### ✅ Phase 8: Edge Cases

- [ ] **Empty Text**
  - Try deleting all text from a field
  - Verify white rectangle covers original

- [ ] **Very Long Text**
  - Enter text longer than original
  - Check text wrapping works

- [ ] **Special Characters**
  - Test UTF-8 characters (é, ñ, ü)
  - Test emojis (may not work in standard fonts)
  - Test mathematical symbols

- [ ] **Multiple Sessions**
  - Complete a full edit cycle
  - Click Clear
  - Upload a different PDF
  - Verify clean state

### ✅ Phase 9: Responsive Design

- [ ] **Desktop View (1920x1080)**
  - Verify layout is centered
  - Check spacing and margins
  - Test all functionality

- [ ] **Tablet View (768x1024)**
  - Verify responsive layout adapts
  - Check toolbar remains accessible
  - Test editing on touch device

- [ ] **Mobile View (375x667)**
  - Verify UI is usable
  - Check buttons are touchable
  - Test upload and editing

### ✅ Phase 10: Performance

- [ ] **Small PDF (1-3 pages)**
  - Measure load time (should be < 2 seconds)
  - Check UI responsiveness

- [ ] **Medium PDF (10-20 pages)**
  - Measure load time (should be < 5 seconds)
  - Test scrolling performance

- [ ] **Large PDF (50+ pages)**
  - Measure load time
  - Check for memory issues
  - Test editing performance

## Sample Test PDFs

Create or find PDFs with these characteristics:

1. **Simple Text PDF** - Plain text, single page, one font
2. **Formatted PDF** - Multiple fonts, bold, italic, colors
3. **Multi-Page PDF** - 5+ pages with varied content
4. **Complex PDF** - Tables, images, mixed layouts
5. **Form PDF** - PDF with form fields (test compatibility)

## Browser Testing Matrix

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 90+     | ✅ Pass |
| Firefox | 88+     | ✅ Pass |
| Safari  | 14+     | ✅ Pass |
| Edge    | 90+     | ✅ Pass |

## Known Issues

Document any issues found during testing:

1. **Issue**: [Description]
   - **Reproduction**: [Steps to reproduce]
   - **Expected**: [Expected behavior]
   - **Actual**: [Actual behavior]
   - **Severity**: [Low/Medium/High]

## Success Criteria

All checkboxes above should be checked (✅) for the application to be considered fully tested and ready for production.

## Reporting Issues

When reporting issues, include:
- Browser name and version
- PDF file (if not sensitive)
- Screenshots or screen recording
- Console errors (F12 → Console tab)
- Steps to reproduce
