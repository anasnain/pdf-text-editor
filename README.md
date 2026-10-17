# PDF Text Editor

A modern, web-based PDF text editor built with Next.js that allows you to edit text in PDF files directly in your browser with visual fidelity.

## Features

- **📤 Drag & Drop Upload**: Upload PDF files via drag-and-drop or file picker
- **📄 Multi-Page Support**: View and edit all pages in a scrollable layout
- **✏️ In-Place Editing**: Click on any text to edit it directly with matched styling
- **🎨 Visual Fidelity**: Automatically matches font family, size, weight, and color
- **📝 Multi-Line Text**: Support for editing both single-line and multi-line text blocks
- **👀 Preview Before Download**: Preview your changes before saving
- **💾 Easy Export**: Download modified PDFs with custom filenames
- **📱 Responsive Design**: Clean, modern UI built with Tailwind CSS

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
- Maintains high-quality rendering with configurable scale

### 2. Text Extraction
- Extracts text items with position, font, size, and color information
- Calculates precise bounding boxes for each text element
- Groups related text items for multi-line support

### 3. Interactive Overlay
- Renders transparent HTML elements over canvas
- Matches extracted font properties for visual consistency
- Provides hover and focus states for better UX

### 4. PDF Export
- Uses pdf-lib to modify the original PDF
- Covers original text with white rectangles
- Redraws edited text at exact coordinates
- Supports standard PDF fonts (Helvetica, Times, Courier families)

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
