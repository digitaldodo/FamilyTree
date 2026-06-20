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
      const res = await fetch(`/api/trees/${activeTreeId}?t=${Date.now()}`, { cache: 'no-store' });
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
    console.log("PATCH PAYLOAD", input);
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

      // POST-SAVE VERIFICATION (client side)
      const verifyRes = await fetch(`/api/members/${id}?t=${Date.now()}`, { cache: 'no-store' });
      const verifyData = await verifyRes.json();
      if (!verifyData.success || (input.firstName && verifyData.data.firstName !== input.firstName)) {
        throw new Error('Database update confirmed failed');
      }

      await refreshTree();
      window.dispatchEvent(new Event('refresh-members'));
      
      // Cache Audit / Invalidation equivalent
      // In a real scenario we'd invalidate react-query caches or Next router cache here
      // But we bypassed the cache on fetch calls above.
      
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

