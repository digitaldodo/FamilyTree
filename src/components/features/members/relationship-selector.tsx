'use client';

import * as React from 'react';
import { useAppStore } from '@/store/use-app-store';
import { useMembers } from '@/hooks/use-members';
import { getEligibleParents, getEligibleSpouses, getEligibleChildren } from '@/utils/relationship';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MemberWithRelations } from '@/types/member';
import { Plus, X } from 'lucide-react';

interface RelationshipSelectorProps {
  currentMemberId?: string;
  currentGenerationId?: string;
  type: 'PARENT' | 'CHILD' | 'SPOUSE';
  label: string;
  onAddRelation: (memberId: string, type: 'PARENT' | 'CHILD' | 'SPOUSE') => void;
  onRemoveRelation: (memberId: string, type: 'PARENT' | 'CHILD' | 'SPOUSE') => void;
  existingRelations: string[]; // array of member IDs already related in this type
  allSelectedIds: string[]; // array of all member IDs already related in the form across all types
  currentGender?: string | null;
}

import { ErrorBoundary } from '@/components/ui/error-boundary';

export function RelationshipSelector({
  currentMemberId,
  currentGenerationId,
  type,
  label,
  onAddRelation,
  onRemoveRelation,
  existingRelations,
  allSelectedIds,
  currentGender
}: RelationshipSelectorProps) {
  const { members, generations } = useMembers();
  const [selectedId, setSelectedId] = React.useState<string>('');

  const validCandidates = React.useMemo(
    () => {
      let candidates: MemberWithRelations[] = [];
      if (type === 'PARENT') candidates = getEligibleParents(members, generations, currentMemberId, currentGenerationId);
      else if (type === 'CHILD') candidates = getEligibleChildren(members, generations, currentMemberId, currentGenerationId);
      else if (type === 'SPOUSE') candidates = getEligibleSpouses(members, generations, currentMemberId, currentGenerationId, currentGender);
      
      // Filter out anyone already selected in the form for ANY relationship
      return candidates.filter(c => !allSelectedIds.includes(c.id));
    },
    [members, generations, currentMemberId, type, currentGenerationId, allSelectedIds, currentGender]
  );

  const handleAdd = () => {
    if (selectedId) {
      onAddRelation(selectedId, type);
      setSelectedId('');
    }
  };

  const isParentLimitReached = type === 'PARENT' && existingRelations.length >= 2;
  const isSpouseLimitReached = type === 'SPOUSE' && existingRelations.length >= 1;
  const isLimitReached = isParentLimitReached || isSpouseLimitReached;

  // If no candidates exist and no existing relations, hide completely
  if (existingRelations.length === 0 && validCandidates.length === 0) {
    return null;
  }

  return (
    <ErrorBoundary>
      <div className="space-y-2 border border-border p-3 rounded-lg bg-card text-card-foreground">
        <h4 className="text-sm font-semibold">{label}</h4>
        
        {/* List Existing */}
        {existingRelations.length > 0 && (
          <ul className="space-y-1 mb-2">
            {existingRelations.map(relId => {
              const relMember = members.find(m => m.id === relId);
              if (!relMember) return null;
              return (
                <li key={relId} className="flex justify-between items-center text-sm p-1 bg-muted rounded">
                  <span>{relMember.firstName} {relMember.lastName}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => onRemoveRelation(relId, type)}>
                    <X className="h-3 w-3" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}

        {/* Add New */}
        {!isLimitReached && validCandidates.length > 0 && (
          <div className="flex gap-2 items-center mt-2">
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={`Select ${label.toLowerCase()}...`} />
              </SelectTrigger>
              <SelectContent>
                {validCandidates.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" variant="outline" size="icon" onClick={handleAdd} disabled={!selectedId}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

