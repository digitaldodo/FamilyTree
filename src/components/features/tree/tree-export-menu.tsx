'use client';

import * as React from 'react';
import { Download, FileDown, Printer } from 'lucide-react';
import { toast } from 'sonner';
import type { Node } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { exportTreeToPDF, printTree } from '@/lib/pdf-export';
import { useOrientationPreference } from '@/lib/export-preferences';
import type { OrientationPreference } from '@/lib/pdf-layout';

interface TreeExportMenuProps {
  treeName: string;
  getNodes: () => Node[];
  className?: string;
}

/**
 * One entry point for Print and PDF so both always use the same orientation
 * state. Landscape is the default; the user's last choice is remembered.
 */
export function TreeExportMenu({ treeName, getNodes, className }: TreeExportMenuProps) {
  const [orientation, setOrientation] = useOrientationPreference();

  const run = (kind: 'pdf' | 'print') => {
    const nodes = getNodes();
    if (!nodes.length) {
      toast.error('Add family members before exporting.');
      return;
    }
    if (kind === 'pdf') {
      toast.promise(exportTreeToPDF(treeName, nodes, { orientation }), {
        loading: 'Building family tree PDF…',
        success: 'PDF downloaded successfully!',
        error: (err) => `Unable to generate PDF: ${err?.message ?? 'Please try again.'}`,
      });
    } else {
      printTree(treeName, nodes, { orientation }).catch((err) =>
        toast.error(`Unable to print: ${err?.message ?? 'Please try again.'}`)
      );
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={className ?? 'rounded-lg h-8 w-8 hover:bg-muted'}
          title="Print or download PDF"
          aria-label="Print or download PDF"
        >
          <Download className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Page orientation</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={orientation}
          onValueChange={(value) => setOrientation(value as OrientationPreference)}
        >
          <DropdownMenuRadioItem value="landscape">Landscape</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="portrait">Portrait</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="auto">Auto (fit tree)</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => run('pdf')}>
          <FileDown className="mr-2 h-4 w-4" /> Download PDF
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => run('print')}>
          <Printer className="mr-2 h-4 w-4" /> Print
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
