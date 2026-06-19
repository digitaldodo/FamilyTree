'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { FamilyTree } from '@/components/features/tree/family-tree';
import { MemberModal } from '@/components/features/members/member-modal';
import { EmptyState } from '@/components/ui/empty-state';
import { TreePine } from 'lucide-react';
import { PageLoader } from '@/components/ui/page-loader';

export default function TreePage() {
  const { activeTreeId, isInitializingTrees } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      <FamilyTree />
      <MemberModal />
    </div>
  );
}
