'use client';

import * as React from 'react';
import { ChevronDown, TreePine, Plus, Crown, Edit3, Eye } from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { cn } from '@/lib/utils';
import type { TreeSummary, TreePermission } from '@/types/tree';

interface TreeSelectorProps {
  onCreateTree?: () => void;
}

const roleConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  OWNER: { label: 'Owner', icon: Crown, className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  ADMIN: { label: 'Admin', icon: Crown, className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  EDITOR: { label: 'Editor', icon: Edit3, className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  VIEWER: { label: 'Viewer', icon: Eye, className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
};

export function TreeSelector({ onCreateTree }: TreeSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const { activeTreeId, setActiveTreeId, setUserRole, userTrees } = useAppStore();

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
    setUserRole(tree.role);
    setIsOpen(false);
  };

  return (
    <div ref={ref} className="relative px-3 mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left group',
          isOpen && 'bg-muted'
        )}
      >
        <TreePine className="h-4 w-4 text-primary shrink-0" />
        <span className="flex-1 text-sm font-medium truncate">
          {activeTree ? activeTree.name : 'Select a tree'}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground shrink-0 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute left-3 right-3 z-50 mt-1.5 rounded-xl bg-background border border-border shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="max-h-[240px] overflow-y-auto py-1.5 custom-scrollbar">
            {userTrees.length === 0 && (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                No trees yet
              </div>
            )}
            {userTrees.map((tree) => {
              const role = roleConfig[tree.role || 'VIEWER'];
              const RoleIcon = role.icon;
              const isActive = tree.id === activeTreeId;

              return (
                <button
                  key={tree.id}
                  onClick={() => handleSelect(tree)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 mx-1.5 rounded-lg text-left transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted text-foreground'
                  )}
                  style={{ width: 'calc(100% - 0.75rem)' }}
                >
                  <TreePine className="h-3.5 w-3.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{tree.name}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium', role.className)}>
                        <RoleIcon className="h-2.5 w-2.5" />
                        {role.label}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md shrink-0">
                    {tree._count.members}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-border p-1.5">
            <button
              onClick={() => {
                setIsOpen(false);
                onCreateTree?.();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create New Tree
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
