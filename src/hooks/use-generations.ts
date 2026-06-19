import { useState, useCallback, useEffect } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { Generation } from '@/types/member';
import { toast } from 'sonner';

export function useGenerations() {
  const { activeTreeId, generations, setGenerations, addGeneration, updateGeneration: updateStoreGen, deleteGeneration: deleteStoreGen } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGenerations = useCallback(async () => {
    if (!activeTreeId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/trees/${activeTreeId}/generations`);
      const data = await res.json();
      if (data.success) {
        setGenerations(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch generations', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTreeId, setGenerations]);

  // Initial fetch when active tree changes
  useEffect(() => {
    fetchGenerations();
  }, [fetchGenerations]);

  const handleCreate = async (name: string, insertAt?: number) => {
    if (!activeTreeId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/trees/${activeTreeId}/generations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, insertAt }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to create generation');

      toast.success('Generation created successfully');
      await fetchGenerations(); // Refetch to get the updated order indexes
      return data.data;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create generation');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRename = async (id: string, name: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/generations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to rename generation');

      updateStoreGen(id, data.data);
      toast.success('Generation renamed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to rename generation');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, action?: 'moveMembers' | 'deleteMembers', targetId?: string) => {
    setIsSubmitting(true);
    try {
      const queryParams = new URLSearchParams();
      if (action) queryParams.append('action', action);
      if (targetId) queryParams.append('targetId', targetId);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

      const res = await fetch(`/api/generations/${id}${queryString}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to delete generation');

      deleteStoreGen(id);
      toast.success('Generation deleted successfully');
      await fetchGenerations(); // Refetch to ensure order indexes are in sync
      
      // We also need to refetch members if members were moved or deleted!
      // But this hook doesn't have useMembers. 
      // We can rely on the caller to refresh members or trigger a window reload or global event.
      // Easiest is to dispatch a custom event or let the caller handle it.
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
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/generations/${id}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to move generation');

      toast.success('Generation moved successfully');
      await fetchGenerations(); // Refetch to get the updated order indexes
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
