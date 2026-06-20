import { useQuery } from '@tanstack/react-query';
import { TreeSummary } from '@/types/tree';

export function useUserTrees() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['userTrees'],
    queryFn: async () => {
      const res = await fetch('/api/trees');
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      return json.data as TreeSummary[];
    },
  });

  return {
    userTrees: data || [],
    isLoading,
    error,
    refetch,
  };
}
