import { useState, useMemo, useEffect } from 'react';
import { useMembers } from './use-members';
import { useAppStore } from '@/store/use-app-store';
import { generateTreeLayout } from '@/utils/tree-layout';
import { toast } from 'sonner';
import { useFilteredGenerations } from './use-filtered-generations';
import { GenealogyEngine } from '@/domain/inference/genealogy-engine';

export function useFamilyTree(treeId?: string) {
  const { members: rawMembers, generations, isLoading, error: fetchError } = useMembers(treeId);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const selectedGenerationIds = useAppStore(s => s.selectedGenerationIds);
  const setSelectedGenerationIds = useAppStore(s => s.setSelectedGenerationIds);

  const visibleGenerations = useFilteredGenerations(generations, selectedGenerationIds);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Enforce consecutive generations for the tree view
  useEffect(() => {
    const safeVisibleGens = Array.isArray(visibleGenerations) ? visibleGenerations : [];
    if (safeVisibleGens.length <= 1) return;

    const sortedActive = [...safeVisibleGens].sort((a, b) => a.orderIndex - b.orderIndex);
    const minOrder = sortedActive[0].orderIndex;
    const maxOrder = sortedActive[sortedActive.length - 1].orderIndex;

    const safeGens = Array.isArray(generations) ? generations : [];
    const requiredGenerations = safeGens.filter(g => g.orderIndex >= minOrder && g.orderIndex <= maxOrder);

    if (requiredGenerations.length > safeVisibleGens.length) {
      const requiredIds = requiredGenerations.map(g => g.id);
      const safeSelectedIds = Array.isArray(selectedGenerationIds) ? selectedGenerationIds : [];
      // Combine required IDs with any other selected IDs
      const newIds = Array.from(new Set([...safeSelectedIds, ...requiredIds]));
      setSelectedGenerationIds(newIds);
      toast("Missing generations automatically included.", {
        description: "Tree view only supports consecutive generations."
      });
    }
  }, [selectedGenerationIds, visibleGenerations, generations, setSelectedGenerationIds]);

  const familyGraph = useMemo(() => {
    return GenealogyEngine.buildFamilyGraph(rawMembers);
  }, [rawMembers]);

  // Transform members into React Flow Nodes and Edges
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    return generateTreeLayout(familyGraph, visibleGenerations, isMobile);
  }, [familyGraph, visibleGenerations, isMobile]);

  return {
    members: rawMembers, // original array for legacy UI compatibility
    familyGraph, // new pure deterministic graph
    generations,
    initialNodes,
    initialEdges,
    isLoading,
    error: fetchError || error,
  };
}
