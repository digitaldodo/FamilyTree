'use client';

import { Modal } from '@/components/ui/modal';
import { useAppStore } from '@/store/use-app-store';
import { useMembers } from '@/hooks/use-members';
import { User2, Calendar, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MemberModal() {
  const { isMemberModalOpen, setIsMemberModalOpen, selectedMemberId } = useAppStore();
  const { members } = useMembers();

  const member = members.find(m => m.id === selectedMemberId);

  if (!member) return null;

  return (
    <Modal 
      isOpen={isMemberModalOpen} 
      onClose={() => setIsMemberModalOpen(false)}
      className="max-w-2xl w-full p-0 overflow-hidden"
    >
      <div className="h-32 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 relative" />
      
      <div className="px-6 pb-6 relative">
        <div className="flex justify-between items-end mb-4">
          <div className="relative -mt-16 rounded-full border-4 border-background overflow-hidden w-28 h-28 bg-muted flex items-center justify-center">
            {member.avatar ? (
              <img src={member.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User2 className="w-12 h-12 text-muted-foreground" />
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold">{member.firstName} {member.lastName}</h2>
          <p className="text-muted-foreground">Generation {member.generation}</p>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">About</h4>
              <p className="text-sm">
                {member.bio || "No biography provided for this family member."}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Details</h4>
              <div className="space-y-2 text-sm">
                {member.birthDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Born: {new Date(member.birthDate).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center text-muted-foreground font-bold">G</span>
                  <span>Gender: {member.gender || 'Unknown'}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Relationships</h4>
            <div className="space-y-3">
              {/* Spouses */}
              {member.relationsFrom.filter(r => r.type === 'SPOUSE').length > 0 && (
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Spouse(s)</p>
                  {member.relationsFrom.filter(r => r.type === 'SPOUSE').map(r => {
                    const spouse = members.find(m => m.id === r.toId);
                    return <p key={r.id} className="font-medium text-sm">{spouse?.firstName} {spouse?.lastName}</p>
                  })}
                </div>
              )}
              {/* Parents */}
              {member.relationsTo.filter(r => r.type === 'PARENT').length > 0 && (
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Parents</p>
                  {member.relationsTo.filter(r => r.type === 'PARENT').map(r => {
                    const parent = members.find(m => m.id === r.fromId);
                    return <p key={r.id} className="font-medium text-sm">{parent?.firstName} {parent?.lastName}</p>
                  })}
                </div>
              )}
              {/* Children */}
              {member.relationsFrom.filter(r => r.type === 'PARENT').length > 0 && (
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Children</p>
                  {member.relationsFrom.filter(r => r.type === 'PARENT').map(r => {
                    const child = members.find(m => m.id === r.toId);
                    return <p key={r.id} className="font-medium text-sm">{child?.firstName} {child?.lastName}</p>
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
