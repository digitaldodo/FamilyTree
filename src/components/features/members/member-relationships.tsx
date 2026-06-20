import React, { useMemo } from 'react';
import { Users } from 'lucide-react';
import { MemberWithRelations } from '@/types/member';
import { MemberAvatar } from './member-avatar';
import { GenealogyEngine } from '@/domain/inference/genealogy-engine';

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

  const familyGraph = useMemo(() => {
    return GenealogyEngine.buildFamilyGraph(safeMembersForFind);
  }, [safeMembersForFind]);

  const derived = familyGraph.derivedRelationships[member.id] || {
    parents: [],
    children: [],
    spouses: [],
    siblings: [],
    ancestors: []
  };

  const parentMembers = getMembersByIds(derived.parents);
  const childMembers = getMembersByIds(derived.children);
  const spouseMembers = getMembersByIds(derived.spouses);
  const siblingMembers = getMembersByIds(derived.siblings);
  
  // Grandparents
  const grandparentsIds = derived.parents.flatMap(pid => familyGraph.derivedRelationships[pid]?.parents || []);
  const grandparentMembers = getMembersByIds(Array.from(new Set(grandparentsIds)));

  // Grandchildren
  const grandchildrenIds = derived.children.flatMap(cid => familyGraph.derivedRelationships[cid]?.children || []);
  const grandchildMembers = getMembersByIds(Array.from(new Set(grandchildrenIds)));

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
