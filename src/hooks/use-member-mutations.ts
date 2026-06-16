import { useState } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { CreateMemberInput, UpdateMemberInput, MemberWithRelations } from '@/types/member';
import { toast } from 'sonner';

export function useMemberMutations() {
  const { addMember, updateMember: updateStoreMember, deleteMember: deleteStoreMember, setIsMemberModalOpen, activeTreeId } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (input: CreateMemberInput) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...input,
          treeId: input.treeId || activeTreeId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create member');
      }

      // Optimistic UI: add to store with empty relations (API returns the created member)
      const newMember: MemberWithRelations = {
        ...data.data,
        relationsFrom: data.data.relationsFrom || [],
        relationsTo: data.data.relationsTo || [],
      };

      addMember(newMember);
      toast.success('Member added successfully');
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
      const res = await fetch(`/api/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update member');
      }

      // Update store with full member data
      const { members } = useAppStore.getState();
      const existing = members.find(m => m.id === id);
      const updated: MemberWithRelations = {
        ...existing,
        ...data.data,
        relationsFrom: existing?.relationsFrom || [],
        relationsTo: existing?.relationsTo || [],
      };

      updateStoreMember(id, updated);
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
      const res = await fetch(`/api/members/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete member');
      }

      deleteStoreMember(id);
      toast.success('Member removed successfully');
      setIsMemberModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete member');
    }
  };

  const handleShiftGenerations = async (insertAt: number) => {
    if (!activeTreeId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/trees/${activeTreeId}/generations/shift`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ insertAt }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to shift generations');
      }
      
      // Update store members optimistic UI
      const { members, setMembers } = useAppStore.getState();
      const updatedMembers = members.map(m => {
        if ((m.generation ?? 0) >= insertAt) {
          return { ...m, generation: (m.generation ?? 0) + 1 };
        }
        return m;
      });
      setMembers(updatedMembers);
      
      toast.success('Generations shifted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to shift generations');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createMember: handleCreate,
    updateMember: handleUpdate,
    deleteMember: handleDelete,
    shiftGenerations: handleShiftGenerations,
    isSubmitting
  };
}
