import { useState } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { CreateMemberInput, UpdateMemberInput } from '@/types/member';
import { toast } from 'sonner';

export function useMemberMutations() {
  const setIsMemberModalOpen = useAppStore(s => s.setIsMemberModalOpen);
  const setIsEditingMember = useAppStore(s => s.setIsEditingMember);
  const activeTreeId = useAppStore(s => s.activeTreeId);
  const selectedTreeVersionId = useAppStore(s => s.selectedTreeVersionId);
  const addChangeEvent = useAppStore(s => s.addChangeEvent);
  const hasConflict = useAppStore(s => s.hasConflict);
  const isReadOnly = useAppStore(s => s.isReadOnly);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkCanEdit = () => {
    if (isReadOnly) {
      toast.error('Cannot edit in read-only mode.');
      return false;
    }
    if (hasConflict) {
      toast.error('Cannot edit while in conflict state. Please refresh.');
      return false;
    }
    return true;
  };

  const handleCreate = async (input: CreateMemberInput) => {
    if (!checkCanEdit()) return;
    setIsSubmitting(true);
    try {
      const temporaryId = `temp-${Date.now()}`;
      addChangeEvent({
        id: crypto.randomUUID(),
        treeId: input.treeId || activeTreeId || '',
        versionId: selectedTreeVersionId || '',
        userId: 'local',
        timestamp: new Date().toISOString(),
        type: 'ADD_MEMBER',
        payload: {
           member: input,
           temporaryId
        }
      });
      
      toast.success('Member creation queued');
      setIsEditingMember(false);
      setIsMemberModalOpen(false);
      return { id: temporaryId };
    } catch (error: any) {
      toast.error(error.message || 'Failed to queue member creation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: string, input: UpdateMemberInput) => {
    if (!checkCanEdit()) return;
    setIsSubmitting(true);
    try {
      addChangeEvent({
        id: crypto.randomUUID(),
        treeId: activeTreeId || '',
        versionId: selectedTreeVersionId || '',
        userId: 'local',
        timestamp: new Date().toISOString(),
        type: 'UPDATE_MEMBER',
        payload: {
           memberId: id,
           changes: input
        }
      });

      toast.success('Member update queued');
      setIsEditingMember(false);
      return { id };
    } catch (error: any) {
      toast.error(error.message || 'Failed to queue update');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!checkCanEdit()) return;
    try {
      addChangeEvent({
        id: crypto.randomUUID(),
        treeId: activeTreeId || '',
        versionId: selectedTreeVersionId || '',
        userId: 'local',
        timestamp: new Date().toISOString(),
        type: 'DELETE_MEMBER',
        payload: {
           memberId: id
        }
      });
      
      toast.success('Member deletion queued');
      setIsEditingMember(false);
      setIsMemberModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to queue deletion');
    }
  };

  return {
    createMember: handleCreate,
    updateMember: handleUpdate,
    deleteMember: handleDelete,
    isSubmitting
  };
}
