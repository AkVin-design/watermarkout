import { Check } from 'lucide-react';
import { Card } from './ui/Card';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { FileTypeIndicator } from './FileTypeIndicator';
import { formatFileSize } from '@/engines/utils';
import type { ProcessingResult, FileType } from '@/engines/types';

interface ResultPreviewProps {
  result: ProcessingResult;
  resultUrl: string;
  originalUrl?: string;
  fileType: FileType;
}

export function ResultPreview({ result, resultUrl, originalUrl, fileType }: ResultPreviewProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto animate-fade-in">
      <div className="space-y-6">
        {/* Summary */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
            <Check className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="font-medium">
              {result.watermarksFound > 0
                ? `${result.watermarksFound} watermark${result.watermarksFound > 1 ? 's' : ''} removed`
                : 'Processing complete'}
            </p>
            <p className="text-sm text-text-muted">
              {formatFileSize(result.originalSize)} &rarr; {formatFileSize(result.processedSize)}
              {' '}
              &middot; {(result.duration / 1000).toFixed(1)}s
              {result.strategy && ` \u00B7 ${result.strategy}`}
            </p>
          </div>
        </div>

        {/* Preview */}
        {fileType === 'image' && originalUrl && (
          <BeforeAfterSlider
            beforeSrc={originalUrl}
            afterSrc={resultUrl}
            className="aspect-video"
          />
        )}

        {fileType === 'pdf' && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-surface">
            <FileTypeIndicator type="pdf" />
            <div>
              <p className="text-sm font-medium">{result.fileName}</p>
              <p className="text-xs text-text-muted">{formatFileSize(result.processedSize)}</p>
            </div>
          </div>
        )}

        {fileType === 'docx' && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-surface">
            <FileTypeIndicator type="docx" />
            <div>
              <p className="text-sm font-medium">{result.fileName}</p>
              <p className="text-xs text-text-muted">{formatFileSize(result.processedSize)}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
