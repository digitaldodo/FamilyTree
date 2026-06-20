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
