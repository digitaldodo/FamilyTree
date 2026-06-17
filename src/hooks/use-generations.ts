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

  const handleDelete = async (id: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/generations/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to delete generation');

      deleteStoreGen(id);
      toast.success('Generation deleted successfully');
      await fetchGenerations(); // Refetch to ensure order indexes are in sync
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete generation');
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
  };
}
