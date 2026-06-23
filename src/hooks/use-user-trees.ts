import { useQuery } from '@tanstack/react-query';
import { TreeSummary } from '@/types/tree';

const EMPTY_TREES: TreeSummary[] = [];

export function useUserTrees() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['userTrees'],
    queryFn: async () => {
      const res = await fetch('/api/trees');
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON response from server");
      }
      if (!res.ok || !json.success) throw new Error(json.message);
      return json.data as TreeSummary[];
    },
  });

  return {
    userTrees: data || EMPTY_TREES,
    isLoading,
    error,
    refetch,
  };
}
