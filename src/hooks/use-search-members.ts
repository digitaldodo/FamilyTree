import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { MemberWithRelations } from '@/types/member';

export function useSearchMembers() {
  const { members, searchQuery, generationFilter } = useAppStore();
  const [filteredMembers, setFilteredMembers] = useState<MemberWithRelations[]>([]);

  useEffect(() => {
    const handler = setTimeout(() => {
      let filtered = members;
      
      if (generationFilter !== 'all') {
        filtered = filtered.filter(m => m.generationId === generationFilter);
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

      setFilteredMembers(filtered);
    }, 300); // 300ms debounce

    return () => clearTimeout(handler);
  }, [searchQuery, members, generationFilter]);

  return {
    filteredMembers,
  };
}
