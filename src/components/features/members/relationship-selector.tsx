'use client';

import * as React from 'react';
import { useAppStore } from '@/store/use-app-store';
import { getValidRelationshipCandidates } from '@/utils/relationship';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MemberWithRelations } from '@/types/member';
import { Plus, X } from 'lucide-react';

interface RelationshipSelectorProps {
  currentMemberId?: string;
  type: 'PARENT' | 'CHILD' | 'SPOUSE' | 'SIBLING';
  label: string;
  onAddRelation: (memberId: string, type: 'PARENT' | 'CHILD' | 'SPOUSE' | 'SIBLING') => void;
  onRemoveRelation: (memberId: string, type: 'PARENT' | 'CHILD' | 'SPOUSE' | 'SIBLING') => void;
  existingRelations: string[]; // array of member IDs already related in this type
}

import { ErrorBoundary } from '@/components/ui/error-boundary';

export function RelationshipSelector({
  currentMemberId,
  type,
  label,
  onAddRelation,
  onRemoveRelation,
  existingRelations
}: RelationshipSelectorProps) {
  const { members } = useAppStore();
  const [selectedId, setSelectedId] = React.useState<string>('');

  const validCandidates = React.useMemo(
    () => getValidRelationshipCandidates(members, currentMemberId, type),
    [members, currentMemberId, type]
  );

  const handleAdd = () => {
    if (selectedId) {
      onAddRelation(selectedId, type);
      setSelectedId('');
    }
  };

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
        <div className="flex gap-2 items-center">
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
      </div>
    </ErrorBoundary>
  );
}

