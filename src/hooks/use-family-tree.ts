import { useMemo } from 'react';
import { useMembers } from './use-members';
import { useAppStore } from '@/store/use-app-store';
import { useFilteredGenerations } from './use-filtered-generations';
import { GenealogyEngine } from '@/domain/inference/genealogy-engine';
import { safeArray, safeGraph } from '@/lib/safe-helpers';
import { MemberWithRelations } from '@/types/member';


export function useFamilyTree(treeId?: string) {
  const { members: rawMembers, generations, isLoading, error: fetchError } = useMembers(treeId);

  const selectedGenerationIds = useAppStore(s => s.selectedGenerationIds);

  const visibleGenerations = useFilteredGenerations(generations, selectedGenerationIds);
  const visibleGenerationIds = useMemo(
    () => new Set(visibleGenerations.map(g => g.id)),
    [visibleGenerations]
  );
  const visibleMembers = useMemo(() => {
    const safeMembers = safeArray<MemberWithRelations>(rawMembers);
    return safeMembers.filter(member => visibleGenerationIds.has(member.generationId));
  }, [rawMembers, visibleGenerationIds]);

  const activeTreeId = useAppStore(s => s.activeTreeId);
  const selectedTreeVersionId = useAppStore(s => s.selectedTreeVersionId);

  const familyGraph = useMemo(() => {
    const rawGraph = GenealogyEngine.buildFamilyGraph({
      treeId: treeId || activeTreeId || '',
      versionId: selectedTreeVersionId,
      members: visibleMembers,
      generations: visibleGenerations
    });
    return safeGraph(rawGraph);
  }, [visibleMembers, visibleGenerations, treeId, activeTreeId, selectedTreeVersionId]);

  return {
    members: visibleMembers,
    allMembers: rawMembers,
    familyGraph, // new pure deterministic graph
    generations: visibleGenerations, // return visible ones specifically
    allGenerations: generations, // raw DB generations
    isLoading,
    error: fetchError,
  };
}
