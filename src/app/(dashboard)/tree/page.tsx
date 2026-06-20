'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { FamilyTree } from '@/components/features/tree/family-tree';
import { MemberModal } from '@/components/features/members/member-modal';
import { EmptyState } from '@/components/ui/empty-state';
import { TreePine, History } from 'lucide-react';
import { PageLoader } from '@/components/ui/page-loader';
import { useQuery } from '@tanstack/react-query';

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
    return (
      <div className="absolute inset-0 w-full h-full flex items-center justify-center">
        <EmptyState
          icon={TreePine}
          title="Select a Family Tree"
          description="Choose a family tree from the sidebar to visualize it."
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full">
      {/* Version Selector overlay */}
      {versions.length > 0 && (
        <div className="absolute top-4 right-4 z-50 bg-background/80 backdrop-blur-md p-2 rounded-lg border shadow-sm flex items-center gap-2">
          <History className="w-4 h-4 text-muted-foreground" />
          <select 
            className="bg-transparent text-sm outline-none cursor-pointer"
            value={selectedTreeVersionId || ''}
            onChange={(e) => setSelectedTreeVersionId(e.target.value || null)}
          >
            <option value="">Latest (Active)</option>
            {versions.map((v: any) => (
              <option key={v.id} value={v.id}>
                {v.name || 'Snapshot'} - {new Date(v.createdAt).toLocaleDateString()}
              </option>
            ))}
          </select>
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

