import { Download } from 'lucide-react';
import { Button } from './ui/Button';
import { downloadBlob } from '@/engines/utils';
import type { ProcessingResult } from '@/engines/types';

interface DownloadButtonProps {
  result: ProcessingResult;
}

export function DownloadButton({ result }: DownloadButtonProps) {
  const handleDownload = () => {
    downloadBlob(result.blob, result.fileName);
  };

  return (
    <Button size="lg" onClick={handleDownload}>
      <Download className="w-5 h-5" />
      Download Cleaned File
    </Button>
  );
}
