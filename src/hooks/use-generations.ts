import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store/use-app-store';
import { Generation } from '@/types/member';
import { toast } from 'sonner';

export function useGenerations(treeId?: string) {
  const { activeTreeId } = useAppStore();
  const queryClient = useQueryClient();
  const resolvedTreeId = treeId || activeTreeId;

  // Instead of fetching generations from /api/trees/:id/generations,
  // we can use the same tree payload to avoid duplicate requests, or keep it separate if needed.
  // We'll reuse the 'tree' query to take advantage of parallel caching!
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['tree', resolvedTreeId],
    queryFn: async () => {
      const res = await fetch(`/api/trees/${resolvedTreeId}?t=${Date.now()}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      return json.data;
    },
    enabled: !!resolvedTreeId,
  });

  const generations: Generation[] = data?.generations || [];

  // No Zustand sync for generations anymore

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGenerations = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleCreate = async (name: string, insertAt?: number) => {
    if (!resolvedTreeId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/trees/${resolvedTreeId}/generations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, insertAt }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to create generation');

      toast.success('Generation created successfully');
      queryClient.invalidateQueries({ queryKey: ['tree', resolvedTreeId] });
      return json.data;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create generation');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRename = async (id: string, name: string) => {
    if (!resolvedTreeId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/generations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to rename generation');

      toast.success('Generation renamed successfully');
      queryClient.invalidateQueries({ queryKey: ['tree', resolvedTreeId] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to rename generation');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, action?: 'moveMembers' | 'deleteMembers', targetId?: string) => {
    if (!resolvedTreeId) return;
    setIsSubmitting(true);
    try {
      const queryParams = new URLSearchParams();
      if (action) queryParams.append('action', action);
      if (targetId) queryParams.append('targetId', targetId);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

      const res = await fetch(`/api/generations/${id}${queryString}`, {
        method: 'DELETE',
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to delete generation');

      toast.success('Generation deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['tree', resolvedTreeId] });
      
      if (action) {
        window.dispatchEvent(new Event('refresh-members'));
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete generation');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    if (!resolvedTreeId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/generations/${id}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to move generation');

      toast.success('Generation moved successfully');
      queryClient.invalidateQueries({ queryKey: ['tree', resolvedTreeId] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to move generation');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    generations,
    isLoading,
    isSubmitting,
    fetchGenerations,
    createGeneration: handleCreate,
    renameGeneration: handleRename,
    deleteGeneration: handleDelete,
    moveGeneration: handleMove,
  };
}

