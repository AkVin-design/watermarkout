import { WifiOff, RefreshCw, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/Button';

interface PWAPromptProps {
  isOffline: boolean;
  needsUpdate: boolean;
  onUpdate: () => void;
}

export function PWAPrompt({ isOffline, needsUpdate, onUpdate }: PWAPromptProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  if (needsUpdate) {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface border border-border shadow-lg">
          <RefreshCw className="w-4 h-4 text-accent" />
          <span className="text-sm">Update available</span>
          <Button size="sm" onClick={onUpdate}>
            Refresh
          </Button>
          <button onClick={() => setDismissed(true)} className="text-text-muted hover:text-text">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (isOffline) {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-surface border border-warning/30 shadow-lg">
          <WifiOff className="w-4 h-4 text-warning" />
          <span className="text-sm text-text-secondary">Offline — app still works</span>
        </div>
      </div>
    );
  }

  return null;
}
