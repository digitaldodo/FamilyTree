import { useState } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { CreateMemberInput, UpdateMemberInput, MemberWithRelations } from '@/types/member';
import { toast } from 'sonner';

export function useMemberMutations() {
  const { setMembers, setIsMemberModalOpen, setIsEditingMember, activeTreeId } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refreshTree = async () => {
    if (!activeTreeId) return;
    try {
      const res = await fetch(`/api/trees/${activeTreeId}`);
      const data = await res.json();
      if (res.ok && data.success) {
        const treeMembers: MemberWithRelations[] = (data.data.members || []).map((m: any) => ({
          ...m,
          relationsFrom: m.relationsFrom || [],
          relationsTo: m.relationsTo || [],
        }));
        setMembers(treeMembers);
      }
    } catch (e) {
      console.error('Failed to refresh tree', e);
    }
  };

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

      await refreshTree();
      window.dispatchEvent(new Event('refresh-members'));
      toast.success('Member added successfully');
      setIsEditingMember(false);
      setIsMemberModalOpen(false);
      return data.data;
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

      await refreshTree();
      window.dispatchEvent(new Event('refresh-members'));
      toast.success('Member updated successfully');
      setIsEditingMember(false);
      return data.data;
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

      await refreshTree();
      window.dispatchEvent(new Event('refresh-members'));
      toast.success('Member removed successfully');
      setIsEditingMember(false);
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

