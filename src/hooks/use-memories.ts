import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MemoryFormData } from '@/validations/memory.schema';

export function useMemories(treeId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ['memories', treeId];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!treeId) return [];
      const res = await fetch(`/api/memories?treeId=${treeId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch memories');
      return data.data;
    },
    enabled: !!treeId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: MemoryFormData) => {
      const res = await fetch(`/api/memories?treeId=${treeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to create memory');
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Memory added successfully');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to add memory');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: MemoryFormData }) => {
      const res = await fetch(`/api/memories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to update memory');
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Memory updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update memory');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/memories/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to delete memory');
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Memory deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete memory');
    },
  });

  return {
    memories: query.data,
    isLoading: query.isLoading,
    error: query.error,
    createMemory: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateMemory: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteMemory: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
