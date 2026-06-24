import { useState } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { CreateMemberInput, UpdateMemberInput } from '@/types/member';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTreeCollaboration } from './use-tree-collaboration';

export function useMemberMutations(treeId?: string) {
  const setIsMemberModalOpen = useAppStore(s => s.setIsMemberModalOpen);
  const setIsEditingMember = useAppStore(s => s.setIsEditingMember);
  const activeTreeId = useAppStore(s => s.activeTreeId);
  const resolvedTreeId = treeId || activeTreeId;
  const hasConflict = useAppStore(s => s.hasConflict);
  const isReadOnly = useAppStore(s => s.isReadOnly);
  const selectedTreeVersionId = useAppStore(s => s.selectedTreeVersionId);
  const addChangeEvent = useAppStore(s => s.addChangeEvent);
  const { syncChanges } = useTreeCollaboration(resolvedTreeId, selectedTreeVersionId);
  
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
        if (!text) throw new Error("Empty response from server");
        data = JSON.parse(text);
      } catch (err) {
        throw new Error("Invalid JSON response from server");
      }
      if (!res.ok || !data?.success) throw new Error(data?.message || 'Failed to create member');
      return data;
    },
    onSuccess: async (data) => {
      if (!data?.success) {
        toast.error(data?.message || 'Failed to create member');
        return;
      }
      if (data.data) {
        addChangeEvent({
          id: crypto.randomUUID(),
          treeId: resolvedTreeId || '',
          versionId: selectedTreeVersionId || 'live',
          userId: 'local',
          timestamp: new Date().toISOString(),
          type: 'ADD_MEMBER',
          payload: { member: data.data, temporaryId: data.data.id }
        } as any);
        const synced = await syncChanges();
        if (!synced) return;
      }
      queryClient.invalidateQueries({ queryKey: ['tree', resolvedTreeId, selectedTreeVersionId || 'live'] });
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
        if (!text) throw new Error("Empty response from server");
        data = JSON.parse(text);
      } catch (err) {
        throw new Error("Invalid JSON response from server");
      }
      if (!res.ok || !data?.success) throw new Error(data?.message || "Update failed");
      
      // If it's a success, compare before and after?
      // It's handled by server returning success: false if validation fails.
      return data;
    },
    onSuccess: async (data) => {
      if (!data?.success) {
        toast.error(data?.message || "Update failed");
        return;
      }
      if (data.data) {
        addChangeEvent({
          id: crypto.randomUUID(),
          treeId: resolvedTreeId || '',
          versionId: selectedTreeVersionId || 'live',
          userId: 'local',
          timestamp: new Date().toISOString(),
          type: 'UPDATE_MEMBER',
          payload: { memberId: data.data.id, changes: data.data }
        } as any);
        const synced = await syncChanges();
        if (!synced) return;
      }
      queryClient.invalidateQueries({ queryKey: ['tree', resolvedTreeId, selectedTreeVersionId || 'live'] });
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
        if (!text) throw new Error("Empty response from server");
        data = JSON.parse(text);
      } catch (err) {
        throw new Error("Invalid JSON response from server");
      }
      if (!res.ok || !data?.success) throw new Error(data?.message || 'Failed to delete member');
      return data;
    },
    onSuccess: async (data, id) => {
      if (!data?.success) {
        toast.error(data?.message || 'Failed to delete member');
        return;
      }
      addChangeEvent({
        id: crypto.randomUUID(),
        treeId: resolvedTreeId || '',
        versionId: selectedTreeVersionId || 'live',
        userId: 'local',
        timestamp: new Date().toISOString(),
        type: 'DELETE_MEMBER',
        payload: { memberId: id }
      } as any);
      const synced = await syncChanges();
      if (!synced) return;
      queryClient.invalidateQueries({ queryKey: ['tree', resolvedTreeId, selectedTreeVersionId || 'live'] });
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
