'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  ArrowUpToLine,
  ArrowDownToLine,
  Pencil,
  ArrowUp,
  ArrowDown,
  Trash2,
} from 'lucide-react';

interface GenerationActionMenuProps {
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
  index,
  totalGenerations,
  onAddAbove,
  onAddBelow,
  onRename,
  onMoveUp,
  onMoveDown,
  onDelete,
}: GenerationActionMenuProps) {

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 flex items-center justify-center focus-visible:ring-1 focus-visible:ring-ring"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56 z-50">
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAddAbove(); }} className="cursor-pointer py-2">
          <ArrowUpToLine className="w-4 h-4 mr-3 text-muted-foreground" /> Add Above
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAddBelow(); }} className="cursor-pointer py-2">
          <ArrowDownToLine className="w-4 h-4 mr-3 text-muted-foreground" /> Add Below
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRename(); }} className="cursor-pointer py-2">
          <Pencil className="w-4 h-4 mr-3 text-muted-foreground" /> Rename
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={(e) => { e.stopPropagation(); onMoveUp(); }} 
          disabled={index === 0}
          className="cursor-pointer py-2"
        >
          <ArrowUp className="w-4 h-4 mr-3 text-muted-foreground" /> Move Up
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={(e) => { e.stopPropagation(); onMoveDown(); }} 
          disabled={index === totalGenerations - 1}
          className="cursor-pointer py-2"
        >
          <ArrowDown className="w-4 h-4 mr-3 text-muted-foreground" /> Move Down
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem 
          onClick={(e) => { e.stopPropagation(); onDelete(); }} 
          className="cursor-pointer py-2 text-destructive focus:bg-destructive focus:text-destructive-foreground"
        >
          <Trash2 className="w-4 h-4 mr-3" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
