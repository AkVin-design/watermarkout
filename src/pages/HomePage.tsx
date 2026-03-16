import { useState, useCallback, useMemo } from 'react';
import {
  Shield, Zap, WifiOff, FileStack, Layers, SlidersHorizontal,
  Upload, ChevronDown, ChevronUp, ArrowRight, RotateCcw,
} from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { PageMeta } from '@/components/layout/PageMeta';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DropZone } from '@/components/DropZone';
import { FilePreview } from '@/components/FilePreview';
import { ProcessingView } from '@/components/ProcessingView';
import { ResultPreview } from '@/components/ResultPreview';
import { DownloadButton } from '@/components/DownloadButton';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { SettingsPanel } from '@/components/SettingsPanel';
import { useDropZone } from '@/hooks/useDropZone';
import { useFileProcessor } from '@/hooks/useFileProcessor';
import { DEFAULT_OPTIONS } from '@/engines/types';
import type { ProcessingOptions } from '@/engines/types';
import { faqItems } from '@/content/faq';
import { features } from '@/content/features';

const iconMap: Record<string, typeof Shield> = {
  Shield, Zap, WifiOff, FileStack, Layers, SlidersHorizontal,
};

export function HomePage() {
  const dropZone = useDropZone();
  const processor = useFileProcessor();
  const [options, setOptions] = useState<ProcessingOptions>(DEFAULT_OPTIONS);
  const [showSettings, setShowSettings] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);

  const handleProcess = useCallback(() => {
    if (!dropZone.detectedFile) return;
    if (dropZone.detectedFile.type === 'image') {
      setOriginalUrl(URL.createObjectURL(dropZone.detectedFile.file));
    }
    processor.process(dropZone.detectedFile, options);
  }, [dropZone.detectedFile, options, processor]);

  const handleReset = useCallback(() => {
    dropZone.reset();
    processor.reset();
    setOriginalUrl(null);
  }, [dropZone, processor]);

  const handleRetry = useCallback(() => {
    if (!dropZone.detectedFile) return;
    processor.process(dropZone.detectedFile, options);
  }, [dropZone.detectedFile, options, processor]);

  const toolSection = useMemo(() => {
    // Result state
    if (processor.state === 'done' && processor.result && processor.resultUrl) {
      return (
        <div className="space-y-4">
          <ResultPreview
            result={processor.result}
            resultUrl={processor.resultUrl}
            originalUrl={originalUrl ?? undefined}
            fileType={dropZone.detectedFile!.type}
          />
          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
              Process Another
            </Button>
            <DownloadButton result={processor.result} />
          </div>
        </div>
      );
    }

    // Error state
    if (processor.state === 'error') {
      return (
        <ErrorDisplay
          message={processor.error ?? 'Unknown error'}
          onRetry={handleRetry}
          onReset={handleReset}
        />
      );
    }

    // Processing state
    if (processor.state === 'processing') {
      return <ProcessingView progress={processor.progress} onCancel={handleReset} />;
    }

    // File accepted
    if (dropZone.state === 'accepted' && dropZone.detectedFile) {
      return (
        <div className="space-y-4">
          <FilePreview
            detectedFile={dropZone.detectedFile}
            onProcess={handleProcess}
            onRemove={handleReset}
          />
          <div className="flex justify-center">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-sm text-text-muted hover:text-text transition-colors flex items-center gap-1"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {showSettings ? 'Hide' : 'Show'} Settings
            </button>
          </div>
          {showSettings && (
            <SettingsPanel
              options={options}
              onChange={setOptions}
              showPdfOptions={dropZone.detectedFile.type === 'pdf'}
            />
          )}
        </div>
      );
    }

    // Default: drop zone
    return (
      <DropZone
        state={dropZone.state}
        error={dropZone.error}
        onDragEnter={dropZone.onDragEnter}
        onDragOver={dropZone.onDragOver}
        onDragLeave={dropZone.onDragLeave}
        onDrop={dropZone.onDrop}
        onBrowse={dropZone.openFilePicker}
      />
    );
  }, [
    processor, dropZone, options, showSettings, originalUrl,
    handleProcess, handleReset, handleRetry,
  ]);

  return (
    <>
      <PageMeta
        title="WatermarkOut"
        description="Remove watermarks from PDFs, Word documents, and images. Files never leave your browser."
      />

      {/* Hero */}
      <section className="pt-16 pb-8">
        <Container className="text-center">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 leading-tight">
            Remove Watermarks{' '}
            <span className="text-accent">Privately</span>
          </h1>
          <p className="text-text-secondary text-lg sm:text-xl max-w-2xl mx-auto mb-12">
            Drop your PDF, Word document, or image. Processing happens entirely
            in your browser — files never leave your device.
          </p>

          {/* Tool */}
          <div className="mb-16">{toolSection}</div>
        </Container>
      </section>

      {/* How It Works */}
      <section className="py-16 border-t border-border">
        <Container>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '1', icon: Upload, title: 'Drop Your File', desc: 'Drag and drop or browse. PDF, DOCX, and images supported.' },
              { step: '2', icon: Zap, title: 'Instant Processing', desc: 'Watermarks detected and removed in seconds, entirely in your browser.' },
              { step: '3', icon: ArrowRight, title: 'Download Clean File', desc: 'Preview the result and download. Original quality preserved.' },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <div className="text-xs font-bold text-accent mb-2">STEP {step}</div>
                <h3 className="font-display text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm text-text-secondary">{desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Supported Formats */}
      <section className="py-16 border-t border-border">
        <Container>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-12">
            Supported Formats
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { type: 'PDF', color: 'pdf', exts: '.pdf', desc: 'Structural + visual watermark removal. Preserves text when possible.' },
              { type: 'DOCX', color: 'docx', exts: '.docx', desc: 'Strips VML shapes, drawings, and backgrounds from Word documents.' },
              { type: 'Images', color: 'image', exts: '.jpg .png .webp', desc: 'HSL-based detection with neighbourhood-average inpainting.' },
            ].map(({ type, color, exts, desc }) => (
              <Card key={type} hover glass>
                <div className="text-center">
                  <div
                    className="text-2xl font-display font-bold mb-2"
                    style={{ color: `var(--color-${color})` }}
                  >
                    {type}
                  </div>
                  <p className="text-xs font-mono text-text-muted mb-3">{exts}</p>
                  <p className="text-sm text-text-secondary">{desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Features */}
      <section className="py-16 border-t border-border">
        <Container>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-12">
            Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {features.map((feature) => {
              const Icon = iconMap[feature.icon] ?? Shield;
              return (
                <Card key={feature.title} hover>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">{feature.title}</h3>
                      <p className="text-sm text-text-secondary">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-16 border-t border-border">
        <Container>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-2xl mx-auto space-y-3">
            {faqItems.map((item, i) => (
              <div key={i} className="border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-surface transition-colors"
                >
                  <span className="font-medium text-sm">{item.question}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-4 h-4 text-text-muted shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-text-secondary animate-fade-in">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 border-t border-border">
        <Container className="text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4">
            Ready to Remove Watermarks?
          </h2>
          <p className="text-text-secondary mb-8">
            No signup. No upload. No waiting. Just drop your file.
          </p>
          <Button
            size="lg"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <Upload className="w-5 h-5" />
            Get Started
          </Button>
        </Container>
      </section>
    </>
  );
}
