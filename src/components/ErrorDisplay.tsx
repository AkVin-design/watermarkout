import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface ErrorDisplayProps {
  message: string;
  onRetry: () => void;
  onReset: () => void;
}

export function ErrorDisplay({ message, onRetry, onReset }: ErrorDisplayProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto animate-fade-in">
      <div className="flex flex-col items-center gap-4 text-center py-4">
        <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-error" />
        </div>
        <div>
          <p className="font-medium text-error">Processing Failed</p>
          <p className="text-sm text-text-muted mt-1">{message}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" onClick={onReset}>
            Start Over
          </Button>
          <Button size="sm" onClick={onRetry}>
            <RotateCcw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      </div>
    </Card>
  );
}
