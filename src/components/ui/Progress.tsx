import { cn } from '@/lib/cn';

interface ProgressProps {
  value: number;
  label?: string;
  className?: string;
}

export function Progress({ value, label, className }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="flex justify-between mb-2 text-sm">
          <span className="text-text-secondary">{label}</span>
          <span className="text-text-muted font-mono">{Math.round(clamped)}%</span>
        </div>
      )}
      <div className="h-2 bg-surface rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-[width] duration-300 ease-out relative animate-shimmer"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
