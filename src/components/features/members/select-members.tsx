'use client';

import * as React from 'react';
import { X, Search } from 'lucide-react';
import { MemberAvatar } from './member-avatar';
import { Input } from '@/components/ui/input';

interface SelectMembersProps {
  members: any[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function SelectMembers({
  members,
  selectedIds,
  onChange,
}: SelectMembersProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const selectedMembers = React.useMemo(() => {
    return selectedIds
      .map((id) => members.find((m) => m.id === id))
      .filter(Boolean);
  }, [members, selectedIds]);

  const filteredMembers = React.useMemo(() => {
    if (!searchTerm) return members;
    const lower = searchTerm.toLowerCase();
    return members.filter(
      (m) =>
        m.firstName.toLowerCase().includes(lower) ||
        (m.lastName && m.lastName.toLowerCase().includes(lower))
    );
  }, [members, searchTerm]);

  const toggleMember = (memberId: string) => {
    if (selectedIds.includes(memberId)) {
      onChange(selectedIds.filter((id) => id !== memberId));
    } else {
      onChange([...selectedIds, memberId]);
    }
  };

  const removeMember = (memberId: string) => {
    onChange(selectedIds.filter((id) => id !== memberId));
  };

  return (
    <div className="flex flex-col gap-3 border rounded-md p-3 bg-background">
      {/* Selected Members Chips */}
      <div className="flex flex-wrap gap-2">
        {selectedMembers.length === 0 && (
          <span className="text-sm text-muted-foreground py-1">
            No members selected
          </span>
        )}
        {selectedMembers.map((member: any) => (
          <div
            key={member.id}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center gap-1 rounded-full border pl-1 pr-2 py-1 text-xs font-medium transition-colors"
          >
            <MemberAvatar
              imageUrl={member.imageUrl || member.avatar}
              firstName={member.firstName}
              lastName={member.lastName}
              fallbackSize={12}
              className="w-5 h-5"
            />
            <span>
              {member.firstName} {member.lastName}
            </span>
            <button
              type="button"
              className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onClick={(e) => {
                e.preventDefault();
                removeMember(member.id);
              }}
            >
              <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        ))}
      </div>

      <div className="h-px bg-border my-1" />

      {/* Search and List */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members to add..."
            className="pl-9 h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="max-h-40 overflow-y-auto space-y-1 rounded-md border p-1">
          {filteredMembers.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-4">
              No members found.
            </p>
          ) : (
            filteredMembers.map((member: any) => {
              const isSelected = selectedIds.includes(member.id);
              return (
                <label
                  key={member.id}
                  className={`flex items-center gap-3 p-2 rounded-sm cursor-pointer hover:bg-accent/50 ${isSelected ? 'bg-accent' : ''}`}
                >
                  <input
                    type="checkbox"
                    className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                    checked={isSelected}
                    onChange={() => toggleMember(member.id)}
                  />
                  <div className="flex items-center gap-2">
                    <MemberAvatar
                      imageUrl={member.imageUrl || member.avatar}
                      firstName={member.firstName}
                      lastName={member.lastName}
                      fallbackSize={14}
                      className="w-6 h-6"
                    />
                    <span className="text-sm font-medium">
                      {member.firstName} {member.lastName}
                    </span>
                  </div>
                </label>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
