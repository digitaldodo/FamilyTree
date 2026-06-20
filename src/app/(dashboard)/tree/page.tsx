'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { FamilyTree } from '@/components/features/tree/family-tree';
import { MemberModal } from '@/components/features/members/member-modal';
import { EmptyState } from '@/components/ui/empty-state';
import { TreePine, History } from 'lucide-react';
import { PageLoader } from '@/components/ui/page-loader';
import { useQuery } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Check } from 'lucide-react';

export default function TreePage() {
  const { activeTreeId, isInitializingTrees, selectedTreeVersionId, setSelectedTreeVersionId, setIsReadOnly } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: versionsResponse } = useQuery({
    queryKey: ['tree-versions', activeTreeId],
    queryFn: async () => {
      const res = await fetch(`/api/trees/${activeTreeId}/versions`);
      return res.json();
    },
    enabled: !!activeTreeId,
  });

  const versions = versionsResponse?.data || [];

  // Update read-only mode based on selected version
  useEffect(() => {
    if (selectedTreeVersionId) {
      setIsReadOnly(true);
    } else {
      setIsReadOnly(false);
    }
  }, [selectedTreeVersionId, setIsReadOnly]);

  // Reset selected version when changing trees
  useEffect(() => {
    setSelectedTreeVersionId(null);
  }, [activeTreeId, setSelectedTreeVersionId]);

  if (!mounted || isInitializingTrees) {
    return <PageLoader />;
  }

  if (!activeTreeId) {
    return null;
  }

  return (
    <div className="absolute inset-0 w-full h-full">
      {/* Version Selector overlay */}
      {versions.length > 0 && (
        <div className="absolute top-4 right-4 z-50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 bg-background/80 backdrop-blur-md px-3 py-2 rounded-lg border shadow-sm text-sm hover:bg-accent hover:text-accent-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <History className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">
                  {selectedTreeVersionId 
                    ? versions.find((v: any) => v.id === selectedTreeVersionId)?.name || 'Historical Version'
                    : 'Latest (Active)'}
                </span>
                <ChevronDown className="w-4 h-4 text-muted-foreground ml-1 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[240px]">
              <DropdownMenuItem 
                onClick={() => setSelectedTreeVersionId(null)}
                className="flex items-center justify-between cursor-pointer py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">Latest (Active)</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-wider">Active</span>
                </div>
                {!selectedTreeVersionId && <Check className="w-4 h-4 text-primary" />}
              </DropdownMenuItem>
              <div className="h-px bg-border my-1" />
              {versions.map((v: any) => (
                <DropdownMenuItem 
                  key={v.id} 
                  onClick={() => setSelectedTreeVersionId(v.id)}
                  className="flex items-center justify-between cursor-pointer py-2"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{v.name || 'Snapshot'}</span>
                    <span className="text-xs text-muted-foreground">{new Date(v.createdAt).toLocaleDateString()}</span>
                  </div>
                  {selectedTreeVersionId === v.id && <Check className="w-4 h-4 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      
      {selectedTreeVersionId && (
        <div className="absolute top-16 right-4 z-50 bg-yellow-500/10 text-yellow-600 px-3 py-1.5 rounded-md border border-yellow-500/20 text-xs font-medium">
          Viewing Historical Version (Read-only)
        </div>
      )}

      <FamilyTree />
      <MemberModal />
    </div>
  );
}

