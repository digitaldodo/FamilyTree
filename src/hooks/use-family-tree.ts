import { useState, useMemo, useEffect } from 'react';
import { useMembers } from './use-members';
import { useAppStore } from '@/store/use-app-store';
import { toast } from 'sonner';
import { useFilteredGenerations } from './use-filtered-generations';
import { GenealogyEngine } from '@/domain/inference/genealogy-engine';

export function useFamilyTree(treeId?: string) {
  const { members: rawMembers, generations, isLoading, error: fetchError } = useMembers(treeId);
  const [error, setError] = useState<string | null>(null);

  const selectedGenerationIds = useAppStore(s => s.selectedGenerationIds);
  const setSelectedGenerationIds = useAppStore(s => s.setSelectedGenerationIds);

  const visibleGenerations = useFilteredGenerations(generations, selectedGenerationIds);

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

  const [debouncedMembers, setDebouncedMembers] = useState(rawMembers);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedMembers(rawMembers);
    }, 300);
    return () => clearTimeout(handler);
  }, [rawMembers]);

  const activeTreeId = useAppStore(s => s.activeTreeId);
  const selectedTreeVersionId = useAppStore(s => s.selectedTreeVersionId);

  const familyGraph = useMemo(() => {
    return GenealogyEngine.buildFamilyGraph({
      treeId: treeId || activeTreeId || '',
      versionId: selectedTreeVersionId,
      members: debouncedMembers
    });
  }, [debouncedMembers, treeId, activeTreeId, selectedTreeVersionId]);

  return {
    members: rawMembers, // original array for legacy UI compatibility
    familyGraph, // new pure deterministic graph
    generations: visibleGenerations, // return visible ones specifically
    allGenerations: generations, // raw DB generations
    isLoading,
    error: fetchError || error,
  };
}
