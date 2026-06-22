import { useState } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { CreateMemberInput, UpdateMemberInput } from '@/types/member';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useMemberMutations() {
  const setIsMemberModalOpen = useAppStore(s => s.setIsMemberModalOpen);
  const setIsEditingMember = useAppStore(s => s.setIsEditingMember);
  const activeTreeId = useAppStore(s => s.activeTreeId);
  const hasConflict = useAppStore(s => s.hasConflict);
  const isReadOnly = useAppStore(s => s.isReadOnly);
  
  const queryClient = useQueryClient();

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
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, treeId: input.treeId || activeTreeId }),
      });
      let data;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch (err) {
        throw new Error("Invalid JSON response from server");
      }
      if (!res.ok) throw new Error(data?.message || 'Failed to create member');
      return data;
    },
    onSuccess: (data) => {
      if (!data?.success) {
        toast.error(data?.message || 'Failed to create member');
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['tree', activeTreeId] });
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
      const res = await fetch(`/api/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      let data;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : { success: false, message: "Empty response" };
      } catch (err) {
        throw new Error("Invalid JSON response from server");
      }
      if (!res.ok) throw new Error(data?.message || "Update failed");
      return data;
    },
    onSuccess: (data) => {
      if (!data?.success) {
        toast.error(data?.message || "Update failed");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['tree', activeTreeId] });
      toast.success(data.message || "Member updated successfully");
      setIsEditingMember(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Network error occurred');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/members/${id}`, {
        method: 'DELETE',
      });
      let data;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch (err) {
        throw new Error("Invalid JSON response from server");
      }
      if (!res.ok) throw new Error(data?.message || 'Failed to delete member');
      return data;
    },
    onSuccess: (data) => {
      if (!data?.success) {
        toast.error(data?.message || 'Failed to delete member');
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['tree', activeTreeId] });
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
