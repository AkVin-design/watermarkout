import { X, Play } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { FileTypeIndicator } from './FileTypeIndicator';
import type { DetectedFile } from '@/engines/types';

interface FilePreviewProps {
  detectedFile: DetectedFile;
  onProcess: () => void;
  onRemove: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FilePreview({ detectedFile, onProcess, onRemove }: FilePreviewProps) {
  const { file, type } = detectedFile;

  return (
    <Card className="w-full max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4">
        <FileTypeIndicator type={type} size="lg" />

        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{file.name}</p>
          <p className="text-sm text-text-muted">{formatSize(file.size)}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onRemove} aria-label="Remove file">
            <X className="w-4 h-4" />
          </Button>
          <Button size="sm" onClick={onProcess}>
            <Play className="w-4 h-4" />
            Remove Watermark
          </Button>
        </div>
      </div>
    </Card>
  );
}
