import React from 'react';
import { Users } from 'lucide-react';
import { MemberWithRelations } from '@/types/member';
import { MemberAvatar } from './member-avatar';

interface MemberRelationshipsProps {
  member: MemberWithRelations;
  members: MemberWithRelations[];
  onNavigateToMember: (id: string) => void;
  readOnly?: boolean;
  onAddRelationshipsClick?: () => void;
}

export function MemberRelationships({ member, members, onNavigateToMember, readOnly, onAddRelationshipsClick }: MemberRelationshipsProps) {
  const safeMembersForFind = Array.isArray(members) ? members : [];
  
  const getMembersByIds = (ids: string[]) => {
    return ids.map(id => safeMembersForFind.find(m => m.id === id)).filter(Boolean) as MemberWithRelations[];
  };

  let parentMembers: MemberWithRelations[] = [];
  let childMembers: MemberWithRelations[] = [];
  let spouseMembers: MemberWithRelations[] = [];
  let siblingMembers: MemberWithRelations[] = [];
  let grandparentMembers: MemberWithRelations[] = [];
  let grandchildMembers: MemberWithRelations[] = [];

  if (member.inferredRelationships) {
    const inferred = member.inferredRelationships;
    parentMembers = getMembersByIds(inferred.parents);
    childMembers = getMembersByIds(inferred.children);
    spouseMembers = getMembersByIds(inferred.spouses);
    siblingMembers = getMembersByIds(inferred.siblings);
    grandparentMembers = getMembersByIds(inferred.grandparents);
    grandchildMembers = getMembersByIds(inferred.grandchildren);
  } else {
    // Fallback if not populated
    const safeRelsFrom = Array.isArray(member.relationsFrom) ? member.relationsFrom : [];
    const safeRelsTo = Array.isArray(member.relationsTo) ? member.relationsTo : [];

    const spouseIds = [
      ...safeRelsFrom.filter((r) => r.type === 'SPOUSE').map(r => r.toId),
      ...safeRelsTo.filter((r) => r.type === 'SPOUSE').map(r => r.fromId),
    ];
    spouseMembers = getMembersByIds([...new Set(spouseIds)]);

    const parents = safeRelsTo.filter((r) => r.type === 'PARENT');
    parentMembers = getMembersByIds(parents.map(r => r.fromId));

    const children = safeRelsFrom.filter((r) => r.type === 'PARENT');
    childMembers = getMembersByIds(children.map(r => r.toId));

    const derivedSiblingIds = new Set<string>();
    if (parentMembers.length > 0) {
      safeMembersForFind.forEach((m) => {
        if (m.id === member.id) return;
        const mSafeRelsTo = Array.isArray(m.relationsTo) ? m.relationsTo : [];
        const mParentIds = mSafeRelsTo.filter((r) => r.type === 'PARENT').map((r) => r.fromId);
        if (mParentIds.some((pid) => parentMembers.some(p => p.id === pid))) {
          derivedSiblingIds.add(m.id);
        }
      });
    }
    siblingMembers = getMembersByIds(Array.from(derivedSiblingIds));
  }

  const hasRelationships = spouseMembers.length > 0 || parentMembers.length > 0 || childMembers.length > 0 || siblingMembers.length > 0 || grandparentMembers.length > 0 || grandchildMembers.length > 0;

  const renderSection = (title: string, list: MemberWithRelations[], colorClasses?: string, iconClassName?: string) => {
    if (list.length === 0) return null;
    return (
      <div>
        <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{title}</h4>
        <div className="flex flex-wrap gap-2">
          {list.map((m) => (
            <div key={m.id} onClick={() => onNavigateToMember(m.id)} className={`flex items-center gap-2 p-1.5 pr-4 rounded-full cursor-pointer transition-colors border ${colorClasses || 'bg-secondary hover:bg-secondary/80 border-border'}`}>
              <div className={`w-8 h-8 rounded-full overflow-hidden relative flex items-center justify-center ${colorClasses ? 'bg-background/50' : 'bg-muted'}`}>
                <MemberAvatar imageUrl={m.imageUrl} firstName={m.firstName} lastName={m.lastName} gender={m.gender} fallbackSize={16} iconClassName={iconClassName} />
              </div>
              <span className="text-sm font-medium">{m.firstName} {m.lastName}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Family Connections</h3>
      
      {hasRelationships ? (
        <div className="space-y-4">
          {renderSection('Grandparents', grandparentMembers)}
          {renderSection('Parents', parentMembers)}
          {renderSection('Spouses', spouseMembers, 'bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100 hover:bg-rose-100 dark:hover:bg-rose-900/50 border-rose-200/50 dark:border-rose-800/30', 'text-rose-500')}
          {renderSection('Siblings', siblingMembers)}
          {renderSection('Children', childMembers)}
          {renderSection('Grandchildren', grandchildMembers)}
        </div>
      ) : (
        !readOnly && (
          <div className="text-center py-8 bg-muted/30 rounded-2xl border border-dashed border-border">
            <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm font-medium text-muted-foreground">No family connections yet</p>
            {onAddRelationshipsClick && (
              <button onClick={onAddRelationshipsClick} className="text-sm text-purple-500 hover:underline mt-1">
                Add relationships
              </button>
            )}
          </div>
        )
      )}
    </div>
  );
}
