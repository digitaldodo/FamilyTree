import { useMemo } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { MemberWithRelations } from '@/types/member';
import { useMembers } from './use-members';

export function useSearchMembers() {
  const { searchQuery, selectedGenerationIds } = useAppStore();
  const { members: rawMembers } = useMembers();

  const filteredMembers = useMemo(() => {
    let filtered = Array.isArray(rawMembers) ? rawMembers : [];
    
    if (selectedGenerationIds.length > 0) {
      filtered = filtered.filter(m => selectedGenerationIds.includes(m.generationId));
    } else {
      filtered = []; // If no generations selected, no members match.
    }
    
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
  }, [searchQuery, rawMembers, selectedGenerationIds]);

  return {
    filteredMembers,
  };
}
