import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store/use-app-store';
import { Generation } from '@/types/member';
import { toast } from 'sonner';
import { useMembers } from './use-members';

export function useGenerations(treeId?: string) {
  const { activeTreeId } = useAppStore();
  const queryClient = useQueryClient();
  const resolvedTreeId = treeId || activeTreeId;

  const { generations, isLoading, fetchMembers } = useMembers(resolvedTreeId || undefined);

  const createMutation = useMutation({
    mutationFn: async ({ name, insertAt }: { name: string; insertAt?: number }) => {
      const res = await fetch(`/api/trees/${resolvedTreeId}/generations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, insertAt }),
      });
      let json = null;
    try {
      json = await res.json();
    } catch (e) {
      throw new Error("Invalid server response");
    }
      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to create generation');
      return json.data;
    },
    onSuccess: () => {
      toast.success('Generation created successfully');
      queryClient.invalidateQueries({ queryKey: ['tree', resolvedTreeId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create generation');
    }
  });

  const renameMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const res = await fetch(`/api/generations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      let json = null;
    try {
      json = await res.json();
    } catch (e) {
      throw new Error("Invalid server response");
    }
      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to rename generation');
      return json.data;
    },
    onSuccess: () => {
      toast.success('Generation renamed successfully');
      queryClient.invalidateQueries({ queryKey: ['tree', resolvedTreeId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to rename generation');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, action, targetId }: { id: string; action?: 'moveMembers' | 'deleteMembers'; targetId?: string }) => {
      const queryParams = new URLSearchParams();
      if (action) queryParams.append('action', action);
      if (targetId) queryParams.append('targetId', targetId);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

      const res = await fetch(`/api/generations/${id}${queryString}`, {
        method: 'DELETE',
      });
      let json = null;
    try {
      json = await res.json();
    } catch (e) {
      throw new Error("Invalid server response");
    }
      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to delete generation');
      return json.data;
    },
    onSuccess: () => {
      toast.success('Generation deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['tree', resolvedTreeId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete generation');
    }
  });

  const moveMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: 'up' | 'down' }) => {
      const res = await fetch(`/api/generations/${id}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction }),
      });
      let json = null;
    try {
      json = await res.json();
    } catch (e) {
      throw new Error("Invalid server response");
    }
      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to move generation');
      return json.data;
    },
    onSuccess: () => {
      toast.success('Generation moved successfully');
      queryClient.invalidateQueries({ queryKey: ['tree', resolvedTreeId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to move generation');
    }
  });

  const handleCreate = async (name: string, insertAt?: number) => {
    if (!resolvedTreeId) return;
    return createMutation.mutateAsync({ name, insertAt });
  };

  const handleRename = async (id: string, name: string) => {
    if (!resolvedTreeId) return;
    return renameMutation.mutateAsync({ id, name });
  };

  const handleDelete = async (id: string, action?: 'moveMembers' | 'deleteMembers', targetId?: string) => {
    if (!resolvedTreeId) return;
    return deleteMutation.mutateAsync({ id, action, targetId });
  };

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    if (!resolvedTreeId) return;
    return moveMutation.mutateAsync({ id, direction });
  };

  const isSubmitting = createMutation.isPending || renameMutation.isPending || deleteMutation.isPending || moveMutation.isPending;

  return {
    generations,
    isLoading,
    isSubmitting,
    fetchGenerations: fetchMembers,
    createGeneration: handleCreate,
    renameGeneration: handleRename,
    deleteGeneration: handleDelete,
    moveGeneration: handleMove,
  };
}

