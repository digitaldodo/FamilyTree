import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { MemberWithRelations } from '@/types/member';

const mockMembers: MemberWithRelations[] = [
  {
    id: 'm1',
    firstName: 'Arthur',
    lastName: 'Pendragon',
    birthDate: '1940-01-01',
    gender: 'MALE',
    generation: 1,
    treeId: 'default',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    relationsFrom: [
      { id: 'r1', type: 'SPOUSE', fromId: 'm1', toId: 'm2', createdAt: new Date().toISOString() },
      { id: 'r2', type: 'PARENT', fromId: 'm1', toId: 'm3', createdAt: new Date().toISOString() },
      { id: 'r3', type: 'PARENT', fromId: 'm1', toId: 'm4', createdAt: new Date().toISOString() }
    ],
    relationsTo: []
  },
  {
    id: 'm2',
    firstName: 'Guinevere',
    lastName: 'Pendragon',
    birthDate: '1942-05-12',
    gender: 'FEMALE',
    generation: 1,
    treeId: 'default',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    relationsFrom: [
      { id: 'r4', type: 'PARENT', fromId: 'm2', toId: 'm3', createdAt: new Date().toISOString() },
      { id: 'r5', type: 'PARENT', fromId: 'm2', toId: 'm4', createdAt: new Date().toISOString() }
    ],
    relationsTo: [{ id: 'r1', type: 'SPOUSE', fromId: 'm1', toId: 'm2', createdAt: new Date().toISOString() }]
  },
  {
    id: 'm3',
    firstName: 'Mordred',
    lastName: 'Pendragon',
    birthDate: '1965-10-31',
    gender: 'MALE',
    generation: 2,
    treeId: 'default',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    relationsFrom: [],
    relationsTo: [
      { id: 'r2', type: 'PARENT', fromId: 'm1', toId: 'm3', createdAt: new Date().toISOString() },
      { id: 'r4', type: 'PARENT', fromId: 'm2', toId: 'm3', createdAt: new Date().toISOString() }
    ]
  },
  {
    id: 'm4',
    firstName: 'Morgana',
    lastName: 'Le Fay',
    birthDate: '1968-02-14',
    gender: 'FEMALE',
    generation: 2,
    treeId: 'default',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    relationsFrom: [],
    relationsTo: [
      { id: 'r3', type: 'PARENT', fromId: 'm1', toId: 'm4', createdAt: new Date().toISOString() },
      { id: 'r5', type: 'PARENT', fromId: 'm2', toId: 'm4', createdAt: new Date().toISOString() }
    ]
  }
];

export function useMembers() {
  const { members, setMembers } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchMembers = async () => {
      if (members.length > 0) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        // Simulate fetch
        setTimeout(() => {
          if (isMounted) {
            setMembers(mockMembers);
            setIsLoading(false);
          }
        }, 600);
      } catch (error) {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchMembers();

    return () => {
      isMounted = false;
    };
  }, [members.length, setMembers]);

  return { members, isLoading };
}
