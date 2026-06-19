import { useState, useMemo, useEffect } from 'react';
import { useMembers } from './use-members';
import { useAppStore } from '@/store/use-app-store';
import { generateTreeLayout } from '@/utils/tree-layout';
import { toast } from 'sonner';

export function useFamilyTree(treeId?: string) {
  const { members, isLoading, error: fetchError } = useMembers(treeId);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const generations = useAppStore(s => s.generations);
  const generationFilters = useAppStore(s => s.generationFilters);
  const setGenerationFilters = useAppStore(s => s.setGenerationFilters);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Enforce consecutive generations for the tree view
  useEffect(() => {
    if (generationFilters.length === 0 || generations.length === 0) return;

    const activeGenerations = generations.filter(g => generationFilters.includes(g.id));
    if (activeGenerations.length <= 1) return;

    const sortedActive = [...activeGenerations].sort((a, b) => a.orderIndex - b.orderIndex);
    const minOrder = sortedActive[0].orderIndex;
    const maxOrder = sortedActive[sortedActive.length - 1].orderIndex;

    const requiredGenerations = generations.filter(g => g.orderIndex >= minOrder && g.orderIndex <= maxOrder);

    if (requiredGenerations.length > activeGenerations.length) {
      const requiredIds = requiredGenerations.map(g => g.id);
      setGenerationFilters(requiredIds);
      toast("Missing generations automatically included.", {
        description: "Tree view only supports consecutive generations."
      });
    }
  }, [generationFilters, generations, setGenerationFilters]);

  // Transform members into React Flow Nodes and Edges
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const visibleGenerations = generations.filter(gen => 
      generationFilters.length === 0 || generationFilters.includes(gen.id)
    );
    return generateTreeLayout(members, visibleGenerations, isMobile);
  }, [members, generations, generationFilters, isMobile]);

  return {
    members,
    initialNodes,
    initialEdges,
    isLoading,
    error: fetchError || error,
  };
}
