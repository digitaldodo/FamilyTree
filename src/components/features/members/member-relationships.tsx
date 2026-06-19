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
  const spouses = member.relationsFrom.filter((r) => r.type === 'SPOUSE') || [];
  const parents = member.relationsTo.filter((r) => r.type === 'PARENT') || [];
  const children = member.relationsFrom.filter((r) => r.type === 'PARENT') || [];
  const siblings = [
    ...(member.relationsFrom.filter((r) => r.type === 'SIBLING') || []),
    ...(member.relationsTo.filter((r) => r.type === 'SIBLING') || []),
  ];
  const hasRelationships = spouses.length > 0 || parents.length > 0 || children.length > 0 || siblings.length > 0;

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

          {spouses.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Spouses</h4>
              <div className="flex flex-wrap gap-2">
                {spouses.map((r) => {
                  const s = members.find((m) => m.id === r.toId);
                  if (!s) return null;
                  return (
                    <div key={r.id} onClick={() => onNavigateToMember(s.id)} className="flex items-center gap-2 p-1.5 pr-4 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100 hover:bg-rose-100 dark:hover:bg-rose-900/50 cursor-pointer transition-colors border border-rose-200/50 dark:border-rose-800/30">
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
                {siblings.map((r) => {
                  const sibId = r.fromId === member.id ? r.toId : r.fromId;
                  const sib = members.find((m) => m.id === sibId);
                  if (!sib) return null;
                  return (
                    <div key={r.id} onClick={() => onNavigateToMember(sib.id)} className="flex items-center gap-2 p-1.5 pr-4 rounded-full bg-secondary hover:bg-secondary/80 cursor-pointer transition-colors border border-border">
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
