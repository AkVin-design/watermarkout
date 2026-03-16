import { X } from 'lucide-react';
import { Card } from './ui/Card';
import { Progress } from './ui/Progress';
import { Spinner } from './ui/Spinner';
import { Button } from './ui/Button';
import type { ProcessingProgress } from '@/engines/types';

interface ProcessingViewProps {
  progress: ProcessingProgress | null;
  onCancel: () => void;
}

const stageLabels: Record<string, string> = {
  detecting: 'Detecting file type...',
  loading: 'Loading file...',
  analyzing: 'Analyzing for watermarks...',
  removing: 'Removing watermarks...',
  rebuilding: 'Rebuilding file...',
  done: 'Complete!',
};

export function ProcessingView({ progress, onCancel }: ProcessingViewProps) {
  const label = progress ? stageLabels[progress.stage] ?? progress.message : 'Preparing...';
  const percent = progress?.percent ?? 0;

  return (
    <Card className="w-full max-w-2xl mx-auto animate-fade-in">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Spinner size="md" />
          <div className="flex-1">
            <p className="font-medium">{label}</p>
            {progress?.message && progress.message !== label && (
              <p className="text-sm text-text-muted mt-0.5">{progress.message}</p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel} aria-label="Cancel">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <Progress value={percent} label="Progress" />
      </div>
    </Card>
  );
}
