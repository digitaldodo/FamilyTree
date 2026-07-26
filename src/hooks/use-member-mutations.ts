import { useAppStore } from '@/store/use-app-store';
import { CreateMemberInput, UpdateMemberInput } from '@/types/member';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useMemberMutations(treeId?: string) {
  const setIsMemberModalOpen = useAppStore(s => s.setIsMemberModalOpen);
  const setIsEditingMember = useAppStore(s => s.setIsEditingMember);
  const activeTreeId = useAppStore(s => s.activeTreeId);
  const selectedTreeVersionId = useAppStore(s => s.selectedTreeVersionId);
  const resolvedTreeId = treeId || activeTreeId;
  const hasConflict = useAppStore(s => s.hasConflict);
  const isReadOnly = useAppStore(s => s.isReadOnly);
  
  const queryClient = useQueryClient();

  const refreshTreeQueries = async () => {
    if (!resolvedTreeId) return;
    const versionKey = selectedTreeVersionId || 'live';
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['tree', resolvedTreeId, versionKey] }),
      queryClient.invalidateQueries({ queryKey: ['tree-versions', resolvedTreeId] }),
      queryClient.invalidateQueries({ queryKey: ['members', resolvedTreeId] }),
      queryClient.invalidateQueries({ queryKey: ['search-members', resolvedTreeId] }),
    ]);
    await queryClient.refetchQueries({ queryKey: ['tree', resolvedTreeId, versionKey], type: 'active' });
  };

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

  const createMutation = useMutation({
    mutationFn: async (input: CreateMemberInput) => {
      const payload = { ...input, treeId: input.treeId || activeTreeId };
      const fetcher = await import('@/lib/fetcher').then(m => m.fetchJson);
      const data = await fetcher('/api/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!data?.success) throw new Error(data?.message || 'Failed to create member');
      return data;
    },

    onSuccess: async (data) => {
      if (!data?.success) {
        toast.error(data?.message || 'Failed to create member');
        return;
      }
      await refreshTreeQueries();
      toast.success(data.message || 'Member created successfully');
      setIsEditingMember(false);
      setIsMemberModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Network error occurred');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, input }: { id: string, input: UpdateMemberInput }) => {
      const fetcher = await import('@/lib/fetcher').then(m => m.fetchJson);
      const data = await fetcher(`/api/members/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
      if (!data?.success) throw new Error(data?.message || "Update failed");
      return data;
    },

    onSuccess: async (data) => {
      if (!data?.success) {
        toast.error(data?.message || "Update failed");
        return;
      }
      await refreshTreeQueries();
      toast.success(data.message || "Member updated successfully");
      setIsEditingMember(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Network error occurred');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const fetcher = await import('@/lib/fetcher').then(m => m.fetchJson);
      const data = await fetcher(`/api/members/${id}`, { method: 'DELETE' });
      if (!data?.success) throw new Error(data?.message || 'Failed to delete member');
      return data;
    },

    onSuccess: async (data, id) => {
      if (!data?.success) {
        toast.error(data?.message || 'Failed to delete member');
        return;
      }
      await refreshTreeQueries();
      toast.success(data.message || 'Member deleted successfully');
      setIsEditingMember(false);
      setIsMemberModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Network error occurred');
    }
  });

  const handleCreate = async (input: CreateMemberInput) => {
    if (!checkCanEdit()) return;
    return createMutation.mutateAsync(input);
  };

  const handleUpdate = async (id: string, input: UpdateMemberInput) => {
    if (!checkCanEdit()) return;
    return updateMutation.mutateAsync({ id, input });
  };

  const handleDelete = async (id: string) => {
    if (!checkCanEdit()) return;
    return deleteMutation.mutateAsync(id);
  };

  return {
    createMember: handleCreate,
    updateMember: handleUpdate,
    deleteMember: handleDelete,
    isSubmitting: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
}
