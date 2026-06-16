'use client';

import { useAppStore } from '@/store/use-app-store';
import { useMembers } from '@/hooks/use-members';
import { useSearchMembers } from '@/hooks/use-search-members';
import { MemberCard } from '@/components/features/members/member-card';
import { MemberModal } from '@/components/features/members/member-modal';
import { MemberSearch } from '@/components/features/members/member-search';
import { MemberFilter } from '@/components/features/members/member-filter';
import { ArrowUpToLine, ArrowDownToLine, UserPlus, Plus, UsersRound, TreePine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { PageLoader } from '@/components/ui/page-loader';
import { groupMembersByGeneration } from '@/utils/generation';
import { generationLabel } from '@/utils/helpers';
import { useMemo } from 'react';
import { useMemberMutations } from '@/hooks/use-member-mutations';
export default function MembersPage() {
  const { activeTreeId, userRole } = useAppStore();
  const { isLoading } = useMembers();
  const { filteredMembers } = useSearchMembers();
  const { setIsMemberModalOpen, setSelectedMemberId, setIsEditingMember, setDefaultGenerationForNewMember } = useAppStore();
  const { shiftGenerations } = useMemberMutations();

  const hasEditAccess = userRole === 'OWNER' || userRole === 'ADMIN' || userRole === 'EDITOR';

  const handleAddMember = (genNumber?: number) => {
    setSelectedMemberId(null);
    setDefaultGenerationForNewMember(genNumber ?? null);
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
          <Button className="shrink-0" onClick={() => handleAddMember()}>
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
      ) : totalGenerations === 0 ? (
        <div className="py-12">
          <EmptyState 
            icon={UsersRound}
            title="No family members added yet"
            description="Start building your family tree by adding the first member or creating a generation."
            actionLabel={hasEditAccess ? "Add First Member" : undefined}
            onAction={hasEditAccess ? () => handleAddMember(0) : undefined}
          />
        </div>
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
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3 justify-between">
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
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground tabular-nums mr-2 hidden sm:inline-block">
                    {genMembers.length} {genMembers.length === 1 ? 'member' : 'members'}
                  </span>
                  {hasEditAccess && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleAddMember(genNumber)}>
                        <UserPlus className="w-3.5 h-3.5 mr-1" />
                        Add Member
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => shiftGenerations(genNumber)}>
                        <ArrowUpToLine className="w-3.5 h-3.5 mr-1" />
                        Add Above
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleAddMember(genNumber + 1)}>
                        <ArrowDownToLine className="w-3.5 h-3.5 mr-1" />
                        Add Below
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Generation Members — Horizontal scrolling row */}
              <div className="flex gap-4 overflow-x-auto pb-4 px-1 -mx-1 scrollbar-thin min-h-[140px]">
                {genMembers.length === 0 ? (
                  <div className="w-full h-[120px] rounded-xl border border-dashed border-border bg-muted/20 flex flex-col items-center justify-center text-muted-foreground">
                    <p className="text-sm mb-2">No members in this generation</p>
                    {hasEditAccess && (
                      <Button variant="outline" size="sm" onClick={() => handleAddMember(genNumber)}>
                        <UserPlus className="w-3.5 h-3.5 mr-2" />
                        Add First Member Here
                      </Button>
                    )}
                  </div>
                ) : (
                  genMembers.map((member) => (
                    <div key={member.id} className="shrink-0">
                      <MemberCard member={member} calculatedGeneration={genNumber} />
                    </div>
                  ))
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      <MemberModal />
    </div>
  );
}
