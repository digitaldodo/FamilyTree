import { useState, useEffect } from 'react';
import { TreeMember } from './use-family-tree';

export function useMembers() {
  const [members, setMembers] = useState<TreeMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reusing the same mock logic as useFamilyTree for consistency in Phase 3 UI development
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        // Mock members data
        const mockMembers: TreeMember[] = [
          {
            id: 'm1',
            firstName: 'Arthur',
            lastName: 'Pendragon',
            birthDate: '1940-01-01',
            gender: 'MALE',
            generation: 1,
            relationsFrom: [],
            relationsTo: []
          },
          {
            id: 'm2',
            firstName: 'Guinevere',
            lastName: 'Pendragon',
            birthDate: '1942-05-12',
            gender: 'FEMALE',
            generation: 1,
            relationsFrom: [],
            relationsTo: []
          },
          {
            id: 'm3',
            firstName: 'Mordred',
            lastName: 'Pendragon',
            birthDate: '1965-10-31',
            gender: 'MALE',
            generation: 2,
            relationsFrom: [],
            relationsTo: []
          },
          {
            id: 'm4',
            firstName: 'Morgana',
            lastName: 'Le Fay',
            birthDate: '1968-02-14',
            gender: 'FEMALE',
            generation: 2,
            relationsFrom: [],
            relationsTo: []
          }
        ];

        setTimeout(() => {
          setMembers(mockMembers);
          setIsLoading(false);
        }, 600);
      } catch (error) {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, []);

  return { members, isLoading };
}
