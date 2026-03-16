import { FileText, FileSpreadsheet, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { FileType } from '@/engines/types';

interface FileTypeIndicatorProps {
  type: FileType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const config: Record<FileType, { icon: typeof FileText; colorClass: string; label: string }> = {
  pdf: { icon: FileText, colorClass: 'text-pdf bg-pdf/10', label: 'PDF' },
  docx: { icon: FileSpreadsheet, colorClass: 'text-docx bg-docx/10', label: 'DOCX' },
  image: { icon: ImageIcon, colorClass: 'text-image bg-image/10', label: 'Image' },
};

const sizes = {
  sm: 'w-8 h-8 [&_svg]:w-4 [&_svg]:h-4',
  md: 'w-10 h-10 [&_svg]:w-5 [&_svg]:h-5',
  lg: 'w-12 h-12 [&_svg]:w-6 [&_svg]:h-6',
};

export function FileTypeIndicator({ type, size = 'md', className }: FileTypeIndicatorProps) {
  const { icon: Icon, colorClass, label } = config[type];

  return (
    <div
      className={cn(
        'rounded-xl flex items-center justify-center shrink-0',
        colorClass,
        sizes[size],
        className
      )}
      aria-label={label}
    >
      <Icon />
    </div>
  );
}
