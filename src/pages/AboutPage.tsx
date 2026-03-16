import { FileText, FileSpreadsheet, ImageIcon, Code, Lock, Cpu } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { PageMeta } from '@/components/layout/PageMeta';
import { Card } from '@/components/ui/Card';

export function AboutPage() {
  return (
    <>
      <PageMeta title="About" description="How WatermarkOut works. Technical details about our watermark removal approach." />
      <Container className="py-16 max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-8">How It Works</h1>

        <div className="space-y-12">
          {/* Architecture */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-accent" />
              <h2 className="font-display text-xl font-semibold">Client-Side Architecture</h2>
            </div>
            <p className="text-text-secondary leading-relaxed mb-4">
              WatermarkOut runs entirely in your browser. When you drop a file, JavaScript processes
              it locally using Web Workers for performance. No server receives your file — it stays
              on your device from start to finish.
            </p>
            <p className="text-text-secondary leading-relaxed">
              The application is a Progressive Web App (PWA), meaning it can be installed and used
              offline. All processing libraries are bundled into the app and cached by the Service Worker.
            </p>
          </div>

          {/* PDF */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-pdf" />
              <h2 className="font-display text-lg font-semibold">PDF Watermark Removal</h2>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed mb-3">
              PDFs are processed using two complementary strategies:
            </p>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium mb-1">Strategy 1: Structural Analysis (pdf-lib)</p>
                <p className="text-text-secondary">
                  Parses the PDF&apos;s internal structure to find and remove watermark objects:
                  stamp annotations, marked content blocks (/Artifact, /Watermark), Optional Content
                  Groups (OCGs), and full-page Form XObjects. Preserves text selectability and document structure.
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Strategy 2: Visual Processing (pdfjs + Canvas)</p>
                <p className="text-text-secondary">
                  Renders each page to a canvas at 2x resolution, applies HSL-based watermark pixel
                  detection and neighbourhood-average inpainting, then reconstructs the PDF. Works on
                  any watermark type but loses text selectability.
                </p>
              </div>
              <p className="text-text-muted text-xs">
                In Auto mode, structural analysis runs first. If no watermarks are found, visual
                processing is attempted as a fallback.
              </p>
            </div>
          </Card>

          {/* DOCX */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <FileSpreadsheet className="w-5 h-5 text-docx" />
              <h2 className="font-display text-lg font-semibold">DOCX Watermark Removal</h2>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              DOCX files are ZIP archives containing XML. Watermarks typically live in header files
              (word/header*.xml) as VML shapes (&lt;w:pict&gt;), DrawingML elements
              (&lt;mc:AlternateContent&gt;), or background drawings. WatermarkOut unzips the file,
              strips these elements from the XML, cleans orphaned image references, and repackages
              the ZIP. Document content and formatting are preserved.
            </p>
          </Card>

          {/* Image */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-5 h-5 text-image" />
              <h2 className="font-display text-lg font-semibold">Image Watermark Removal</h2>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed mb-3">
              Images are processed using the Canvas API with two phases:
            </p>
            <div className="space-y-2 text-sm text-text-secondary">
              <p>
                <span className="font-medium text-text">Detection:</span> Each pixel is converted
                to HSL colour space. Pixels with low saturation and high lightness (typical of
                semi-transparent grey/white watermarks) are flagged. Sensitivity is adjustable.
              </p>
              <p>
                <span className="font-medium text-text">Inpainting:</span> Flagged pixels are
                replaced with the weighted average of their non-flagged neighbours within a 5-pixel
                radius, using inverse-distance weighting. This produces smooth fill-ins that blend
                with surrounding content.
              </p>
            </div>
          </Card>

          {/* Libraries */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Code className="w-5 h-5 text-accent" />
              <h2 className="font-display text-xl font-semibold">Open Source Libraries</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { name: 'pdf-lib', desc: 'PDF structural manipulation' },
                { name: 'pdfjs-dist', desc: 'PDF rendering to canvas' },
                { name: 'jsPDF', desc: 'PDF reconstruction from images' },
                { name: 'JSZip', desc: 'DOCX ZIP handling' },
                { name: 'React', desc: 'UI framework' },
                { name: 'Vite', desc: 'Build tooling' },
              ].map(({ name, desc }) => (
                <div key={name} className="p-3 rounded-lg bg-surface border border-border">
                  <p className="font-mono font-medium">{name}</p>
                  <p className="text-text-muted text-xs">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Performance */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-5 h-5 text-accent" />
              <h2 className="font-display text-xl font-semibold">Performance</h2>
            </div>
            <p className="text-text-secondary leading-relaxed">
              Processing uses Web Workers to avoid blocking the main thread. Typical processing
              times: PDFs (structural) under 2 seconds, PDFs (visual) under 10 seconds, DOCX under
              1 second, images under 3 seconds. Maximum supported file size is 100MB.
            </p>
          </div>
        </div>
      </Container>
    </>
  );
}
