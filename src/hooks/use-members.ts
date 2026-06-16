import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { MemberWithRelations } from '@/types/member';

const mockMembers: MemberWithRelations[] = [
  // ── Generation 0: Grandparents ──
  {
    id: 'g1',
    firstName: 'Ram Prasad',
    lastName: 'Gupta',
    birthDate: '1940-03-15',
    gender: 'MALE',
    generation: 0,
    bio: 'Patriarch of the Gupta family. Retired schoolteacher who dedicated his life to education in the community.',
    occupation: 'Retired Teacher',
    treeId: 'default',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    relationsFrom: [
      { id: 'r1', type: 'SPOUSE', fromId: 'g1', toId: 'g2', createdAt: new Date().toISOString() },
      { id: 'r2', type: 'PARENT', fromId: 'g1', toId: 'p1', createdAt: new Date().toISOString() },
      { id: 'r3', type: 'PARENT', fromId: 'g1', toId: 'p3', createdAt: new Date().toISOString() },
    ],
    relationsTo: [],
  },
  {
    id: 'g2',
    firstName: 'Savitri',
    lastName: 'Gupta',
    birthDate: '1943-08-21',
    gender: 'FEMALE',
    generation: 0,
    bio: 'Loving grandmother and homemaker. Known for her warmth and incredible cooking.',
    treeId: 'default',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    relationsFrom: [
      { id: 'r4', type: 'PARENT', fromId: 'g2', toId: 'p1', createdAt: new Date().toISOString() },
      { id: 'r5', type: 'PARENT', fromId: 'g2', toId: 'p3', createdAt: new Date().toISOString() },
    ],
    relationsTo: [
      { id: 'r1', type: 'SPOUSE', fromId: 'g1', toId: 'g2', createdAt: new Date().toISOString() },
    ],
  },

  // ── Generation 1: Parents ──
  {
    id: 'p1',
    firstName: 'Vinod',
    lastName: 'Gupta',
    birthDate: '1968-11-05',
    gender: 'MALE',
    generation: 1,
    bio: 'Eldest son. Runs the family business and carries forward the family values.',
    occupation: 'Business Owner',
    treeId: 'default',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    relationsFrom: [
      { id: 'r6', type: 'SPOUSE', fromId: 'p1', toId: 'p2', createdAt: new Date().toISOString() },
      { id: 'r7', type: 'PARENT', fromId: 'p1', toId: 'c1', createdAt: new Date().toISOString() },
      { id: 'r8', type: 'PARENT', fromId: 'p1', toId: 'c2', createdAt: new Date().toISOString() },
      { id: 'r9', type: 'PARENT', fromId: 'p1', toId: 'c3', createdAt: new Date().toISOString() },
    ],
    relationsTo: [
      { id: 'r2', type: 'PARENT', fromId: 'g1', toId: 'p1', createdAt: new Date().toISOString() },
      { id: 'r4', type: 'PARENT', fromId: 'g2', toId: 'p1', createdAt: new Date().toISOString() },
    ],
  },
  {
    id: 'p2',
    firstName: 'Sunita',
    lastName: 'Gupta',
    birthDate: '1972-04-18',
    gender: 'FEMALE',
    generation: 1,
    bio: 'Devoted mother and homemaker. Keeps the family together with love and care.',
    treeId: 'default',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    relationsFrom: [
      { id: 'r10', type: 'PARENT', fromId: 'p2', toId: 'c1', createdAt: new Date().toISOString() },
      { id: 'r11', type: 'PARENT', fromId: 'p2', toId: 'c2', createdAt: new Date().toISOString() },
      { id: 'r12', type: 'PARENT', fromId: 'p2', toId: 'c3', createdAt: new Date().toISOString() },
    ],
    relationsTo: [
      { id: 'r6', type: 'SPOUSE', fromId: 'p1', toId: 'p2', createdAt: new Date().toISOString() },
    ],
  },
  {
    id: 'p3',
    firstName: 'Rajesh',
    lastName: 'Gupta',
    birthDate: '1971-07-22',
    gender: 'MALE',
    generation: 1,
    bio: 'Younger son of Ram Prasad. Works as an engineer and lives with his family.',
    occupation: 'Engineer',
    treeId: 'default',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    relationsFrom: [
      { id: 'r_sib1', type: 'SIBLING', fromId: 'p3', toId: 'p1', createdAt: new Date().toISOString() },
    ],
    relationsTo: [
      { id: 'r3', type: 'PARENT', fromId: 'g1', toId: 'p3', createdAt: new Date().toISOString() },
      { id: 'r5', type: 'PARENT', fromId: 'g2', toId: 'p3', createdAt: new Date().toISOString() },
    ],
  },

  // ── Generation 2: Children ──
  {
    id: 'c1',
    firstName: 'Harsh',
    lastName: 'Gupta',
    birthDate: '1995-01-12',
    gender: 'MALE',
    generation: 2,
    bio: 'Eldest child of Vinod and Sunita. Software developer with a passion for technology.',
    occupation: 'Software Developer',
    treeId: 'default',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    relationsFrom: [
      { id: 'r_sib2', type: 'SIBLING', fromId: 'c1', toId: 'c2', createdAt: new Date().toISOString() },
      { id: 'r_sib3', type: 'SIBLING', fromId: 'c1', toId: 'c3', createdAt: new Date().toISOString() },
    ],
    relationsTo: [
      { id: 'r7', type: 'PARENT', fromId: 'p1', toId: 'c1', createdAt: new Date().toISOString() },
      { id: 'r10', type: 'PARENT', fromId: 'p2', toId: 'c1', createdAt: new Date().toISOString() },
    ],
  },
  {
    id: 'c2',
    firstName: 'Garima',
    lastName: 'Gupta',
    birthDate: '1998-06-30',
    gender: 'FEMALE',
    generation: 2,
    bio: 'Creative and artistic. Currently pursuing her career in design.',
    occupation: 'Designer',
    treeId: 'default',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    relationsFrom: [
      { id: 'r_sib4', type: 'SIBLING', fromId: 'c2', toId: 'c3', createdAt: new Date().toISOString() },
    ],
    relationsTo: [
      { id: 'r8', type: 'PARENT', fromId: 'p1', toId: 'c2', createdAt: new Date().toISOString() },
      { id: 'r11', type: 'PARENT', fromId: 'p2', toId: 'c2', createdAt: new Date().toISOString() },
      { id: 'r_sib2', type: 'SIBLING', fromId: 'c1', toId: 'c2', createdAt: new Date().toISOString() },
    ],
  },
  {
    id: 'c3',
    firstName: 'Ansh',
    lastName: 'Gupta',
    birthDate: '2002-09-14',
    gender: 'MALE',
    generation: 2,
    bio: 'Youngest in the family. Student with big dreams and a curious mind.',
    occupation: 'Student',
    treeId: 'default',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    relationsFrom: [],
    relationsTo: [
      { id: 'r9', type: 'PARENT', fromId: 'p1', toId: 'c3', createdAt: new Date().toISOString() },
      { id: 'r12', type: 'PARENT', fromId: 'p2', toId: 'c3', createdAt: new Date().toISOString() },
      { id: 'r_sib3', type: 'SIBLING', fromId: 'c1', toId: 'c3', createdAt: new Date().toISOString() },
      { id: 'r_sib4', type: 'SIBLING', fromId: 'c2', toId: 'c3', createdAt: new Date().toISOString() },
    ],
  },
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
