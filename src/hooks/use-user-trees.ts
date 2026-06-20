import { useQuery } from '@tanstack/react-query';
import { TreeSummary } from '@/types/tree';

export function useUserTrees() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['userTrees'],
    queryFn: async () => {
      const res = await fetch('/api/trees');
      let json = null;
    try {
      try {
        json = await res.json();
      } catch (e) {
        throw new Error("Invalid JSON response from server");
      }
    } catch (e) {
      throw new Error("Invalid server response");
    }
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
