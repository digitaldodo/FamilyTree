import { useMemo } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { MemberWithRelations } from '@/types/member';
import { useMembers } from './use-members';
import { useGenerations } from './use-generations';

export function useSearchMembers() {
  const { searchQuery, selectedGenerationIds } = useAppStore();
  const { members: rawMembers } = useMembers();
  const { generations } = useGenerations();

  const filteredMembers = useMemo(() => {
    let filtered = Array.isArray(rawMembers) ? rawMembers : [];
    
    const allGenerationIds = generations.map(g => g.id);
    const effectiveGenerations =
      selectedGenerationIds?.length > 0
        ? selectedGenerationIds
        : allGenerationIds;

    filtered = filtered.filter(m =>
      effectiveGenerations.includes(m.generationId)
    );
    
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.firstName.toLowerCase().includes(lowerQuery) ||
        m.lastName.toLowerCase().includes(lowerQuery) ||
        (m.middleName && m.middleName.toLowerCase().includes(lowerQuery)) ||
        (m.bio && m.bio.toLowerCase().includes(lowerQuery))
      );
    }

    return filtered;
  }, [searchQuery, rawMembers, selectedGenerationIds, generations]);

  return {
    filteredMembers,
  };
}
