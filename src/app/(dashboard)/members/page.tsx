'use client';

import { useMembers } from '@/hooks/use-members';
import { MemberCard } from '@/components/features/members/member-card';
import { MemberModal } from '@/components/features/members/member-modal';
import { Loader2, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MembersPage() {
  const { members, isLoading } = useMembers();

  return (
    <div className="max-w-7xl mx-auto space-y-6 h-full flex flex-col pb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Family Members</h1>
          <p className="text-muted-foreground mt-1">Manage and view all members of your family tree.</p>
        </div>
        <Button className="shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filter members by name..."
          className="w-full max-w-sm h-10 pl-9 pr-4 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
        />
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      )}

      <MemberModal />
    </div>
  );
}
