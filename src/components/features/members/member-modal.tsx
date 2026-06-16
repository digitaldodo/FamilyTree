'use client';

import { Modal } from '@/components/ui/modal';
import { useAppStore } from '@/store/use-app-store';
import { useMembers } from '@/hooks/use-members';
import { User2, Calendar, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MemberForm } from './member-form';
import { MemberDeleteDialog } from './member-delete-dialog';
import { useMemberMutations } from '@/hooks/use-member-mutations';
import { MemoryGallery, Memory } from './memories/memory-gallery';
import * as React from 'react';

export function MemberModal() {
  const { isMemberModalOpen, setIsMemberModalOpen, selectedMemberId, isEditingMember, setIsEditingMember } = useAppStore();
  const { members } = useMembers();
  const { createMember, updateMember, deleteMember, isSubmitting } = useMemberMutations();
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  // If we are editing, but there is no selected member, we are creating a new member
  const member = selectedMemberId ? members.find(m => m.id === selectedMemberId) : undefined;

  // Don't render if it's supposed to view an existing member but none is selected
  if (!member && !isEditingMember) return null;

  const handleClose = () => {
    setIsMemberModalOpen(false);
    setIsEditingMember(false);
  };

  const handleSubmit = async (data: any) => {
    if (member) {
      await updateMember(member.id, data);
    } else {
      await createMember(data);
    }
  };

  const handleDelete = async () => {
    if (member) {
      await deleteMember(member.id);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <Modal 
        isOpen={isMemberModalOpen} 
        onClose={handleClose}
        className="max-w-3xl w-full p-0 overflow-hidden"
      >
        <div className="h-48 bg-gradient-to-r from-primary/20 via-purple-500/20 to-indigo-500/20 relative">
          {member?.coverImage && (
            <img src={member.coverImage} alt="Cover" className="w-full h-full object-cover" />
          )}
        </div>
        
        <div className="px-6 pb-6 relative h-[60vh] overflow-y-auto">
          <div className="flex justify-between items-end mb-4">
            <div className="relative -mt-16 rounded-full border-4 border-background overflow-hidden w-28 h-28 bg-muted flex items-center justify-center">
              {member?.avatar ? (
                <img src={member.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User2 className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            
            {!isEditingMember && member && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditingMember(true)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {isEditingMember ? (
            <div className="mt-4">
              <MemberForm 
                member={member} 
                onSubmit={handleSubmit} 
                onCancel={handleClose} 
                isSubmitting={isSubmitting} 
              />
            </div>
          ) : member && (
            <>
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

              {/* Memory Gallery Section */}
              <div className="mt-8 pt-8 border-t border-border">
                <MemoryGallery 
                  memberId={member.id} 
                  memories={(member as any).media?.filter((m: any) => m.type === 'image') || []} 
                  onUpload={async (url, publicId, caption, eventTag) => {
                    // Logic to save memory to database would go here in Phase 7 or via another mutation
                    console.log('Upload memory', url, publicId);
                  }}
                  onDelete={async (id) => {
                    // Logic to delete memory would go here
                    console.log('Delete memory', id);
                  }}
                />
              </div>
            </>
          )}
        </div>
      </Modal>

      {member && (
        <MemberDeleteDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDelete}
          memberName={`${member.firstName} ${member.lastName}`}
        />
      )}
    </>
  );
}
