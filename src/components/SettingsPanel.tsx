import { Settings } from 'lucide-react';
import { Card } from './ui/Card';
import type { ProcessingOptions, PdfStrategy } from '@/engines/types';

interface SettingsPanelProps {
  options: ProcessingOptions;
  onChange: (options: ProcessingOptions) => void;
  showPdfOptions?: boolean;
}

export function SettingsPanel({ options, onChange, showPdfOptions }: SettingsPanelProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <div className="space-y-5">
        <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <Settings className="w-4 h-4" />
          Settings
        </div>

        {/* Sensitivity */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <label htmlFor="sensitivity" className="text-text-secondary">
              Detection Sensitivity
            </label>
            <span className="text-text-muted font-mono">{options.sensitivity}%</span>
          </div>
          <input
            id="sensitivity"
            type="range"
            min={10}
            max={90}
            value={options.sensitivity}
            onChange={(e) =>
              onChange({ ...options, sensitivity: Number(e.target.value) })
            }
            className="w-full accent-accent"
          />
          <div className="flex justify-between text-xs text-text-muted mt-1">
            <span>Conservative</span>
            <span>Aggressive</span>
          </div>
        </div>

        {/* PDF Strategy */}
        {showPdfOptions && (
          <div>
            <label className="text-sm text-text-secondary mb-2 block">
              PDF Strategy
            </label>
            <div className="flex gap-2">
              {(['auto', 'structural', 'visual'] as PdfStrategy[]).map((strategy) => (
                <button
                  key={strategy}
                  onClick={() => onChange({ ...options, pdfStrategy: strategy })}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    options.pdfStrategy === strategy
                      ? 'bg-accent text-white border-accent'
                      : 'bg-surface text-text-secondary border-border hover:border-border-accent'
                  }`}
                >
                  {strategy.charAt(0).toUpperCase() + strategy.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quality */}
        <div>
          <label className="text-sm text-text-secondary mb-2 block">
            Output Quality
          </label>
          <div className="flex gap-2">
            {(['fast', 'balanced', 'high'] as const).map((q) => (
              <button
                key={q}
                onClick={() => onChange({ ...options, quality: q })}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  options.quality === q
                    ? 'bg-accent text-white border-accent'
                    : 'bg-surface text-text-secondary border-border hover:border-border-accent'
                }`}
              >
                {q.charAt(0).toUpperCase() + q.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
