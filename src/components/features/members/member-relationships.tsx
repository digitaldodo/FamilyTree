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
  // Check BOTH directions for symmetric relationship types (SPOUSE)
  const spouseIds = [
    ...member.relationsFrom.filter((r) => r.type === 'SPOUSE').map(r => r.toId),
    ...member.relationsTo.filter((r) => r.type === 'SPOUSE').map(r => r.fromId),
  ];
  const uniqueSpouseIds = [...new Set(spouseIds)];

  const parents = member.relationsTo.filter((r) => r.type === 'PARENT') || [];
  const children = member.relationsFrom.filter((r) => r.type === 'PARENT') || [];
  
  const parentIds = parents.map((r) => r.fromId);
  const derivedSiblingIds = new Set<string>();
  if (parentIds.length > 0) {
    members.forEach((m) => {
      if (m.id === member.id) return;
      const mParentIds = m.relationsTo.filter((r) => r.type === 'PARENT').map((r) => r.fromId);
      if (mParentIds.some((pid) => parentIds.includes(pid))) {
        derivedSiblingIds.add(m.id);
      }
    });
  }
  const siblings = Array.from(derivedSiblingIds).map(id => members.find(m => m.id === id)).filter(Boolean) as MemberWithRelations[];

  const hasRelationships = uniqueSpouseIds.length > 0 || parents.length > 0 || children.length > 0 || siblings.length > 0;

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Family Connections</h3>
      
      {hasRelationships ? (
        <div className="space-y-4">
          {parents.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Parents</h4>
              <div className="flex flex-wrap gap-2">
                {parents.map((r) => {
                  const p = members.find((m) => m.id === r.fromId);
                  if (!p) return null;
                  return (
                    <div key={r.id} onClick={() => onNavigateToMember(p.id)} className="flex items-center gap-2 p-1.5 pr-4 rounded-full bg-secondary hover:bg-secondary/80 cursor-pointer transition-colors border border-border">
                      <div className="w-8 h-8 rounded-full bg-muted overflow-hidden relative">
                        <MemberAvatar imageUrl={p.imageUrl} firstName={p.firstName} lastName={p.lastName} gender={p.gender} fallbackSize={16} />
                      </div>
                      <span className="text-sm font-medium">{p.firstName} {p.lastName}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {uniqueSpouseIds.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Spouses</h4>
              <div className="flex flex-wrap gap-2">
                {uniqueSpouseIds.map((spouseId) => {
                  const s = members.find((m) => m.id === spouseId);
                  if (!s) return null;
                  return (
                    <div key={spouseId} onClick={() => onNavigateToMember(s.id)} className="flex items-center gap-2 p-1.5 pr-4 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100 hover:bg-rose-100 dark:hover:bg-rose-900/50 cursor-pointer transition-colors border border-rose-200/50 dark:border-rose-800/30">
                      <div className="w-8 h-8 rounded-full bg-rose-200/50 dark:bg-rose-900/50 overflow-hidden relative flex items-center justify-center">
                        <MemberAvatar imageUrl={s.imageUrl} firstName={s.firstName} lastName={s.lastName} gender={s.gender} fallbackSize={16} iconClassName="text-rose-500" />
                      </div>
                      <span className="text-sm font-medium">{s.firstName} {s.lastName}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {children.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Children</h4>
              <div className="flex flex-wrap gap-2">
                {children.map((r) => {
                  const c = members.find((m) => m.id === r.toId);
                  if (!c) return null;
                  return (
                    <div key={r.id} onClick={() => onNavigateToMember(c.id)} className="flex items-center gap-2 p-1.5 pr-4 rounded-full bg-secondary hover:bg-secondary/80 cursor-pointer transition-colors border border-border">
                      <div className="w-8 h-8 rounded-full bg-muted overflow-hidden relative">
                        <MemberAvatar imageUrl={c.imageUrl} firstName={c.firstName} lastName={c.lastName} gender={c.gender} fallbackSize={16} />
                      </div>
                      <span className="text-sm font-medium">{c.firstName} {c.lastName}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {siblings.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Siblings</h4>
              <div className="flex flex-wrap gap-2">
                {siblings.map((sib) => {
                  return (
                    <div key={sib.id} onClick={() => onNavigateToMember(sib.id)} className="flex items-center gap-2 p-1.5 pr-4 rounded-full bg-secondary hover:bg-secondary/80 cursor-pointer transition-colors border border-border">
                      <div className="w-8 h-8 rounded-full bg-muted overflow-hidden relative">
                        <MemberAvatar imageUrl={sib.imageUrl} firstName={sib.firstName} lastName={sib.lastName} gender={sib.gender} fallbackSize={16} />
                      </div>
                      <span className="text-sm font-medium">{sib.firstName} {sib.lastName}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
