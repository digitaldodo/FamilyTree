'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Dropdown } from '@/components/ui/dropdown';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { MoreVertical, ArrowUpToLine, ArrowDownToLine, Pencil, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { Generation } from '@/types/member';

interface GenerationActionMenuProps {
  generation: Generation;
  index: number;
  totalGenerations: number;
  onAddAbove: () => void;
  onAddBelow: () => void;
  onRename: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

export function GenerationActionMenu({
  generation,
  index,
  totalGenerations,
  onAddAbove,
  onAddBelow,
  onRename,
  onMoveUp,
  onMoveDown,
  onDelete,
}: GenerationActionMenuProps) {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  // Use a wrapper to close the sheet automatically upon selection
  const handleAction = (action: () => void) => {
    return (e?: React.MouseEvent | React.PointerEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      action();
      if (isMobile) {
        setIsSheetOpen(false);
      }
    };
  };

  const trigger = (
    <Button 
      variant="ghost" 
      size="sm" 
      className="h-7 w-7 p-0 flex items-center justify-center"
      onClick={(e) => {
        if (isMobile) {
          e.preventDefault();
          e.stopPropagation();
          setIsSheetOpen(true);
        }
      }}
    >
      <MoreVertical className="h-4 w-4" />
    </Button>
  );

  const renderActions = (isMobileView: boolean) => (
    <div className="flex flex-col text-sm w-full gap-1">
      <button 
        className={`flex items-center w-full text-left hover:bg-muted rounded-md ${isMobileView ? 'px-4 py-3 min-h-[44px]' : 'px-4 py-2'}`}
        onClick={handleAction(onAddAbove)}
      >
        <ArrowUpToLine className="w-4 h-4 mr-3 text-muted-foreground" /> Add Above
      </button>
      <button 
        className={`flex items-center w-full text-left hover:bg-muted rounded-md ${isMobileView ? 'px-4 py-3 min-h-[44px]' : 'px-4 py-2'}`}
        onClick={handleAction(onAddBelow)}
      >
        <ArrowDownToLine className="w-4 h-4 mr-3 text-muted-foreground" /> Add Below
      </button>
      
      <div className="h-px bg-border my-1 mx-2" />
      
      <button 
        className={`flex items-center w-full text-left hover:bg-muted rounded-md ${isMobileView ? 'px-4 py-3 min-h-[44px]' : 'px-4 py-2'}`}
        onClick={handleAction(onRename)}
      >
        <Pencil className="w-4 h-4 mr-3 text-muted-foreground" /> Rename
      </button>
      
      <button 
        className={`flex items-center w-full text-left hover:bg-muted rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${isMobileView ? 'px-4 py-3 min-h-[44px]' : 'px-4 py-2'}`}
        onClick={handleAction(onMoveUp)}
        disabled={index === 0}
      >
        <ArrowUp className="w-4 h-4 mr-3 text-muted-foreground" /> Move Up
      </button>
      
      <button 
        className={`flex items-center w-full text-left hover:bg-muted rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${isMobileView ? 'px-4 py-3 min-h-[44px]' : 'px-4 py-2'}`}
        onClick={handleAction(onMoveDown)}
        disabled={index === totalGenerations - 1}
      >
        <ArrowDown className="w-4 h-4 mr-3 text-muted-foreground" /> Move Down
      </button>
      
      <div className="h-px bg-border my-1 mx-2" />
      
      <button 
        className={`flex items-center w-full text-left text-destructive hover:bg-muted hover:text-destructive rounded-md ${isMobileView ? 'px-4 py-3 min-h-[44px]' : 'px-4 py-2'}`}
        onClick={handleAction(onDelete)}
      >
        <Trash2 className="w-4 h-4 mr-3" /> Delete
      </button>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {trigger}
        <BottomSheet
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          title={`Generation ${index + 1}: ${generation.name}`}
        >
          {renderActions(true)}
        </BottomSheet>
      </>
    );
  }

  return (
    <Dropdown trigger={trigger}>
      {renderActions(false)}
    </Dropdown>
  );
}
