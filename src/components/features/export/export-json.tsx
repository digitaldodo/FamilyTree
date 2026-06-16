'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { BackupService } from '@/services/backup.service';
import { toast } from 'sonner';

interface ExportJsonProps {
  treeId: string;
  filename?: string;
}

export function ExportJson({ treeId, filename }: ExportJsonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await BackupService.exportTreeJson(treeId, filename);
      toast.success('Tree backup downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download tree backup.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isExporting}
      onClick={handleExport}
      className="text-xs font-medium"
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Download className="w-4 h-4 mr-2 text-primary" />
      )}
      Backup JSON
    </Button>
  );
}
