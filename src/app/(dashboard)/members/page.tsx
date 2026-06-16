'use client';

import { useAppStore } from '@/store/use-app-store';
import { useMembers } from '@/hooks/use-members';
import { useSearchMembers } from '@/hooks/use-search-members';
import { MemberCard } from '@/components/features/members/member-card';
import { MemberModal } from '@/components/features/members/member-modal';
import { MemberSearch } from '@/components/features/members/member-search';
import { MemberFilter } from '@/components/features/members/member-filter';
import { Plus, UsersRound, TreePine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { PageLoader } from '@/components/ui/page-loader';
import { groupMembersByGeneration } from '@/utils/generation';
import { generationLabel } from '@/utils/helpers';
import { useMemo } from 'react';
export default function MembersPage() {
  const { activeTreeId, userRole } = useAppStore();
  const { isLoading } = useMembers();
  const { filteredMembers } = useSearchMembers();
  const { setIsMemberModalOpen, setSelectedMemberId, setIsEditingMember } = useAppStore();

  const hasEditAccess = userRole === 'OWNER' || userRole === 'ADMIN' || userRole === 'EDITOR';

  const handleAddMember = () => {
    setSelectedMemberId(null);
    setIsEditingMember(true);
    setIsMemberModalOpen(true);
  };

  // Group filtered members by generation
  const generationGroups = useMemo(
    () => groupMembersByGeneration(filteredMembers),
    [filteredMembers]
  );

  const totalGenerations = generationGroups.length;

  if (!activeTreeId) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <EmptyState
          icon={TreePine}
          title="Select a Family Tree"
          description="Choose a family tree from the sidebar to view its members."
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 h-full flex flex-col pb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Family Members</h1>
          <p className="text-muted-foreground mt-1">Your family tree, organized by generation.</p>
        </div>
        {hasEditAccess && (
          <Button className="shrink-0" onClick={handleAddMember}>
            <Plus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <MemberSearch />
        <MemberFilter />
      </div>

      {isLoading ? (
        <PageLoader />
      ) : filteredMembers.length === 0 ? (
        <div className="py-12">
          <EmptyState 
            icon={UsersRound}
            title="No members found"
            description="We couldn't find any family members matching your search criteria."
            actionLabel="Clear Search"
            onAction={() => {
              const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
              if (searchInput) {
                searchInput.value = '';
                searchInput.dispatchEvent(new Event('input', { bubbles: true }));
              }
            }}
          />
        </div>
      ) : (
        <div className="space-y-2">
          {generationGroups.map(([genNumber, genMembers], idx) => (
            <section key={genNumber} className="relative">
              {/* Connector line between generations */}
              {idx > 0 && (
                <div className="absolute left-8 -top-2 w-px h-4 bg-border" aria-hidden="true" />
              )}

              {/* Generation Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {genNumber + 1}
                  </span>
                  <h2 className="text-sm font-semibold text-foreground">
                    Generation {genNumber + 1}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    · {generationLabel(genNumber, totalGenerations)}
                  </span>
                </div>
                <div className="flex-1 h-px bg-border/60" />
                <span className="text-xs text-muted-foreground tabular-nums">
                  {genMembers.length} {genMembers.length === 1 ? 'member' : 'members'}
                </span>
              </div>

              {/* Generation Members — Horizontal scrolling row */}
              <div className="flex gap-4 overflow-x-auto pb-4 px-1 -mx-1 scrollbar-thin">
                {genMembers.map((member) => (
                  <div key={member.id} className="shrink-0">
                    <MemberCard member={member} calculatedGeneration={genNumber} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <MemberModal />
    </div>
  );
}
