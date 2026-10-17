# PDF Text Editor v1.0.0

A modern, web-based PDF text editor built with Next.js that allows you to edit text in PDF files directly in your browser with visual fidelity. Perfect for editing PDF documents while preserving the original styling.

🚀 **Live Demo**: [https://pdf-text-editor-one.vercel.app](https://pdf-text-editor-one.vercel.app)

## ✨ Features

### Core Functionality
- **📤 Drag & Drop Upload**: Upload PDF files via drag-and-drop or file picker
- **📄 Multi-Page Support**: View and edit all pages in a scrollable layout
- **✏️ In-Place Editing**: Click on any text to edit it directly (edit mode always active)
- **💾 Easy Export**: Download modified PDFs with custom filenames
- **👀 Preview Before Download**: Preview your changes before saving
- **📌 Sticky Toolbar**: Save button always accessible while scrolling
- **📋 Collapsible Edits Summary**: Track your changes with click-to-expand summary

### Smart Styling & Formatting
- **🎨 Intelligent Background Detection**: Canvas pixel sampling for accurate background colors
- **⚪ Smart White Detection**: Automatically treats very light grays as pure white
- **🎯 Auto Text Color**: White text on dark backgrounds, black on light (luminance-based)
- **🔤 Bold Font Preservation**: Detects and preserves bold fonts (including embedded fonts)
- **➡️ Auto Right-Alignment**: Dates, numbers, and IDs automatically right-aligned
- **📏 Auto-Scaling**: Long text automatically scales to fit within original bounds
- **🔳 Border Preservation**: Background rectangles sized to avoid covering cell borders
- **📐 Vertical Spacing**: Proper padding from borders to prevent text touching lines

### Advanced Text Handling
- **📝 Multi-Line Text**: Support for editing both single-line and multi-line text blocks
- **🎨 Visual Fidelity**: Matches font family, size, weight, and color from original
- **📊 Table Cell Support**: Preserves dark backgrounds and white text in table cells
- **🔠 Embedded Font Detection**: Recognizes bold variants (f1, f4) in embedded fonts

## Tech Stack

- **Framework**: Next.js 15 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **PDF Rendering**: pdf.js (Mozilla)
- **PDF Manipulation**: pdf-lib
- **State Management**: React hooks

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd myPdfEditor
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

### 1. Upload a PDF

- Drag and drop a PDF file onto the upload area, or
- Click the upload area to browse and select a PDF file

### 2. Edit Text

- Click on any text element in the PDF
- An editable text field will appear with matched styling
- Type your changes
- Click outside or press ESC to finish editing

### 3. Save Your Changes

- Click the "Save PDF" button in the toolbar
- A preview modal will appear showing your modified PDF
- Edit the filename if desired (default: `original_name_edited.pdf`)
- Click "Download" to save the modified PDF

### 4. Start Over

- Click the "Clear" button to reset and upload a new PDF

## Project Structure

```
myPdfEditor/
├── app/
│   ├── page.tsx                    # Main PDF editor page
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles
├── components/
│   ├── FileUploader.tsx            # Drag-drop file upload
│   ├── PDFCanvas.tsx               # PDF page renderer
│   ├── TextOverlay.tsx             # Text overlay orchestration
│   ├── EditableTextField.tsx       # Individual editable field
│   ├── Toolbar.tsx                 # Top toolbar with actions
│   └── PreviewModal.tsx            # Preview before download
├── lib/
│   ├── pdf-renderer.ts             # PDF loading and rendering
│   ├── text-extraction.ts          # Text extraction with styling
│   ├── pdf-export.ts               # PDF modification and export
│   └── font-utils.ts               # Font mapping utilities
└── types/
    └── pdf.types.ts                # TypeScript interfaces
```

## How It Works

### 1. PDF Rendering
- Uses pdf.js to load and render PDF pages to HTML5 canvas
- Maintains high-quality rendering with 2x scale factor
- Stores canvas references for background color sampling

### 2. Text Extraction
- Extracts text items with position, font, size, and color information
- Calculates precise bounding boxes for each text element
- Detects embedded font variants (f1, f4 = bold)
- Groups related text items for multi-line support

### 3. Interactive Overlay
- Renders transparent HTML elements over canvas
- Matches extracted font properties for visual consistency
- Provides hover and focus states for better UX
- Edit mode always active for immediate editing

### 4. Background Color Detection
- Samples 3 pixels (left, center, right) 5px above text
- Averages RGB values for accurate color
- Luminance > 0.85 → forced to pure white (border artifact prevention)
- Luminance < 0.65 → dark background with white text

### 5. Text Alignment Detection
- Pattern matching for dates (DD Mon YYYY format)
- Numbers and IDs automatically detected
- Right-alignment applied to matching patterns
- Preserves visual alignment with other cells

### 6. PDF Export
- Uses pdf-lib to modify the original PDF
- Draws smart background rectangles (height-2pt, y+1pt for border preservation)
- Embeds appropriate font (Helvetica-Bold for f1/f4 fonts)
- Redraws edited text at exact coordinates with proper alignment
- Auto-scales font if text is too wide (minimum 70% of original size)

## Font Support

The application uses the 14 standard PDF fonts for maximum compatibility:

### Helvetica Family
- Helvetica (regular)
- Helvetica-Bold
- Helvetica-Oblique
- Helvetica-BoldOblique

### Times Family
- Times-Roman (regular)
- Times-Bold
- Times-Italic
- Times-BoldItalic

### Courier Family
- Courier (regular)
- Courier-Bold
- Courier-Oblique
- Courier-BoldOblique

### Special Fonts
- Symbol
- ZapfDingbats

## Browser Compatibility

This application requires a modern browser with support for:
- HTML5 Canvas API
- File API
- ArrayBuffer/Blob handling
- ES2020+ JavaScript features

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Limitations

- Custom fonts are mapped to standard PDF fonts (may not match exactly)
- Rotated or heavily transformed text may not position correctly
- Very complex PDFs with unusual layouts may have positioning issues
- Large PDFs (100+ pages) may take longer to load and process

## Development

### Build for Production

```bash
npm run build
```

### Run Production Build

```bash
npm run start
```

### Lint Code

```bash
npm run lint
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- [pdf.js](https://mozilla.github.io/pdf.js/) - Mozilla's PDF rendering engine
- [pdf-lib](https://pdf-lib.js.org/) - PDF manipulation library
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

## Troubleshooting

### PDF Not Loading
- Ensure the file is a valid PDF
- Check browser console for errors
- Try a different PDF file

### Text Not Appearing
- Some PDFs use image-based text (scanned documents) which cannot be edited
- Complex PDFs with unusual encodings may not extract text correctly

### Positioning Issues
- Text with rotations or complex transformations may not position correctly
- Try adjusting the scale or using a simpler PDF

### Download Not Working
- Check browser's download settings
- Ensure pop-ups are not blocked
- Try a different browser

## Support

For issues and questions, please open an issue on GitHub.
