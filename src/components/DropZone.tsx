import { Upload, FileCheck, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from './ui/Button';
import { PrivacyBadge } from './PrivacyBadge';
import type { DropZoneState } from '@/hooks/useDropZone';

interface DropZoneProps {
  state: DropZoneState;
  error: string | null;
  onDragEnter: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onBrowse: () => void;
}

const stateStyles: Record<DropZoneState, string> = {
  idle: 'border-border hover:border-border-accent',
  dragging: 'border-accent bg-accent-muted animate-dropzone-pulse',
  accepted: 'border-success bg-success/5',
  rejected: 'border-error bg-error/5',
};

export function DropZone({
  state,
  error,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
  onBrowse,
}: DropZoneProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          'relative rounded-2xl border-2 border-dashed p-12 sm:p-16 text-center transition-all duration-300 cursor-pointer group',
          'gradient-border',
          stateStyles[state]
        )}
        onClick={onBrowse}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onBrowse();
          }
        }}
        aria-label="Drop a file here or click to browse"
      >
        <div className="flex flex-col items-center gap-4">
          {state === 'rejected' ? (
            <div className="w-16 h-16 rounded-2xl bg-error/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-error" />
            </div>
          ) : state === 'accepted' ? (
            <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center">
              <FileCheck className="w-8 h-8 text-success" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <Upload className="w-8 h-8 text-accent" />
            </div>
          )}

          <div>
            <h3 className="font-display text-xl font-semibold mb-2">
              {state === 'dragging'
                ? 'Drop it here'
                : state === 'rejected'
                  ? 'File not supported'
                  : 'Drop your file here'}
            </h3>
            {error ? (
              <p className="text-error text-sm">{error}</p>
            ) : (
              <p className="text-text-secondary text-sm">
                or{' '}
                <span className="text-accent font-medium">browse files</span>
              </p>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {['PDF', 'DOCX', 'JPG', 'PNG', 'WebP'].map((fmt) => (
              <span
                key={fmt}
                className="px-2.5 py-1 text-xs font-medium rounded-full bg-surface text-text-muted border border-border"
              >
                {fmt}
              </span>
            ))}
          </div>

          {state === 'idle' && (
            <Button
              variant="secondary"
              size="sm"
              className="mt-2"
              onClick={(e) => {
                e.stopPropagation();
                onBrowse();
              }}
            >
              Browse Files
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <PrivacyBadge />
      </div>
    </div>
  );
}
