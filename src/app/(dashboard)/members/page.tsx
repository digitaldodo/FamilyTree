'use client';

import { useMembers } from '@/hooks/use-members';
import { useSearchMembers } from '@/hooks/use-search-members';
import { MemberCard } from '@/components/features/members/member-card';
import { MemberModal } from '@/components/features/members/member-modal';
import { MemberSearch } from '@/components/features/members/member-search';
import { MemberFilter } from '@/components/features/members/member-filter';
import { Loader2, Plus, UsersRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { PageLoader } from '@/components/ui/page-loader';
import { useAppStore } from '@/store/use-app-store';

export default function MembersPage() {
  const { isLoading } = useMembers();
  const { filteredMembers } = useSearchMembers();
  const { setIsMemberModalOpen, setSelectedMemberId, setIsEditingMember } = useAppStore();

  const handleAddMember = () => {
    setSelectedMemberId(null);
    setIsEditingMember(true);
    setIsMemberModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 h-full flex flex-col pb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Family Members</h1>
          <p className="text-muted-foreground mt-1">Manage and view all members of your family tree.</p>
        </div>
        <Button className="shrink-0" onClick={handleAddMember}>
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <MemberSearch />
        <MemberFilter />
      </div>

      {isLoading ? (
        <PageLoader />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
          {filteredMembers.length === 0 && (
            <div className="col-span-full py-12">
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
          )}
        </div>
      )}

      <MemberModal />
    </div>
  );
}
