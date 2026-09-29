'use client';

import * as React from 'react';
import { ChevronDown, TreePine, Plus, Crown, Edit3, Eye, Check } from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { cn } from '@/lib/utils';
import { useUserTrees } from '@/hooks/use-user-trees';
import type { TreeSummary } from '@/types/tree';

interface TreeSelectorProps {
  onCreateTree?: () => void;
  collapsed?: boolean;
}

const roleConfig: Record<
  string,
  { label: string; icon: React.ElementType; className: string }
> = {
  OWNER: {
    label: 'Owner',
    icon: Crown,
    className: 'bg-muted text-foreground',
  },
  ADMIN: {
    label: 'Admin',
    icon: Crown,
    className: 'bg-muted text-foreground',
  },
  EDITOR: {
    label: 'Editor',
    icon: Edit3,
    className: 'bg-muted text-muted-foreground',
  },
  VIEWER: {
    label: 'Viewer',
    icon: Eye,
    className: 'bg-muted text-muted-foreground',
  },
};

export function TreeSelector({ onCreateTree, collapsed = false }: TreeSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const { activeTreeId, setActiveTreeId } = useAppStore();
  const { userTrees } = useUserTrees();

  const activeTree = userTrees.find((t) => t.id === activeTreeId);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (tree: TreeSummary) => {
    setActiveTreeId(tree.id);
    setIsOpen(false);
  };

  if (collapsed) {
    return (
      <div ref={ref} className="relative flex justify-center py-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          title={activeTree ? activeTree.name : 'Select a tree'}
          aria-label="Switch family tree"
        >
          <TreePine className="h-4 w-4" />
        </button>

        {isOpen && (
          <div className="absolute left-full top-0 ml-2 z-50 w-56 rounded-md bg-popover border border-border shadow-md overflow-hidden animate-in fade-in-0 zoom-in-95">
            <div className="px-2.5 py-2 border-b border-border text-xs font-medium text-muted-foreground">
              Switch Family Tree
            </div>
            <div className="max-h-[220px] overflow-y-auto py-1">
              {userTrees.map((tree) => {
                const isActive = tree.id === activeTreeId;
                return (
                  <button
                    key={tree.id}
                    onClick={() => handleSelect(tree)}
                    className={cn(
                      'w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-left transition-colors cursor-pointer',
                      isActive ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-muted text-foreground'
                    )}
                  >
                    <span className="truncate pr-2">{tree.name}</span>
                    {isActive && <Check className="h-3 w-3 shrink-0" />}
                  </button>
                );
              })}
            </div>
            {onCreateTree && (
              <div className="border-t border-border p-1">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onCreateTree();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-foreground hover:bg-muted rounded-sm transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Family Tree
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md hover:bg-muted/70 transition-colors text-left cursor-pointer group',
          isOpen && 'bg-muted'
        )}
        aria-label="Switch family tree"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-muted border border-border/80 flex items-center justify-center shrink-0">
            <TreePine className="h-3.5 w-3.5 text-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate tracking-tight">
              {activeTree ? activeTree.name : 'Family Legacy'}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {activeTree ? `${activeTree._count.members} members` : 'Select tree'}
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform duration-150',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1 rounded-md bg-popover border border-border shadow-md overflow-hidden animate-in fade-in-0 zoom-in-95">
          <div className="max-h-[220px] overflow-y-auto py-1">
            {userTrees.length === 0 && (
              <div className="px-3 py-3 text-center text-xs text-muted-foreground">
                No family trees found
              </div>
            )}
            {userTrees.map((tree) => {
              const role = roleConfig[tree.role || 'VIEWER'];
              const isActive = tree.id === activeTreeId;

              return (
                <button
                  key={tree.id}
                  onClick={() => handleSelect(tree)}
                  className={cn(
                    'w-full flex items-center justify-between px-2.5 py-2 text-left transition-colors cursor-pointer text-xs',
                    isActive
                      ? 'bg-accent text-accent-foreground font-medium'
                      : 'hover:bg-muted text-foreground'
                  )}
                >
                  <div className="min-w-0 pr-2">
                    <p className="truncate font-medium">{tree.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {tree._count.members} members · {role.label}
                    </p>
                  </div>
                  {isActive && <Check className="h-3.5 w-3.5 shrink-0 text-foreground" />}
                </button>
              );
            })}
          </div>

          <div className="border-t border-border p-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onCreateTree?.();
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-muted-foreground" />
              Create Family Tree
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
