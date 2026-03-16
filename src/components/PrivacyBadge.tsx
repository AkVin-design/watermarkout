import { Shield } from 'lucide-react';
import { cn } from '@/lib/cn';

interface PrivacyBadgeProps {
  className?: string;
}

export function PrivacyBadge({ className }: PrivacyBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium',
        'bg-success/10 text-success border border-success/20',
        className
      )}
    >
      <Shield className="w-3.5 h-3.5" />
      Files Never Leave Your Browser
    </div>
  );
}
