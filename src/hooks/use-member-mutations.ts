import { useState } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { createMember, updateMember, deleteMember } from '@/services/member.service';
import { CreateMemberInput, UpdateMemberInput } from '@/types/member';
import { toast } from 'sonner';

export function useMemberMutations() {
  const { addMember, updateMember: updateStoreMember, deleteMember: deleteStoreMember, setIsMemberModalOpen } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (input: CreateMemberInput) => {
    setIsSubmitting(true);
    try {
      // Mocking API call for Phase 4 since we are transitioning to full CRUD
      // In a real scenario, we'd wait for `const result = await createMember(input);`
      // For optimistic UI and ensuring it works without full backend setup:
      const newId = `m-${Date.now()}`;
      const newMember = {
        id: newId,
        ...input,
        middleName: input.middleName || null,
        birthDate: input.birthDate || null,
        deathDate: input.deathDate || null,
        gender: input.gender || null,
        bio: input.bio || null,
        avatar: input.avatar || null,
        phone: input.phone || null,
        email: input.email || null,
        address: input.address || null,
        occupation: input.occupation || null,
        generation: input.generation || 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        relationsFrom: [],
        relationsTo: []
      };

      addMember(newMember);
      toast.success('Member created successfully');
      setIsMemberModalOpen(false);
      return newMember;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: string, input: UpdateMemberInput) => {
    setIsSubmitting(true);
    try {
      const { members } = useAppStore.getState();
      const existing = members.find(m => m.id === id);
      if (!existing) throw new Error('Member not found');

      const updated = {
        ...existing,
        ...input,
        updatedAt: new Date().toISOString()
      };

      updateStoreMember(id, updated as any);
      toast.success('Member updated successfully');
      setIsMemberModalOpen(false);
      return updated;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      deleteStoreMember(id);
      toast.success('Member deleted successfully');
      setIsMemberModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete member');
    }
  };

  return {
    createMember: handleCreate,
    updateMember: handleUpdate,
    deleteMember: handleDelete,
    isSubmitting
  };
}
