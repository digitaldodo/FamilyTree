'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { FamilyTree } from '@/components/features/tree/family-tree';
import { MemberModal } from '@/components/features/members/member-modal';
import { PageLoader } from '@/components/ui/page-loader';

export default function TreePage() {
  const { activeTreeId, isInitializingTrees, selectedTreeVersionId, setSelectedTreeVersionId, setIsReadOnly } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    <div className="absolute inset-0 w-full h-full bg-background">
      {selectedTreeVersionId && (
        <div className="absolute bottom-6 right-6 z-50 bg-yellow-500/10 text-yellow-600 px-4 py-2 rounded-xl border border-yellow-500/20 text-sm font-medium shadow-lg backdrop-blur-md">
          Viewing Historical Version (Read-only)
        </div>
      )}

      <FamilyTree />
      <MemberModal />
    </div>
  );
}

