import { useMemo } from 'react';
import { Generation } from '@/types/member';

export function useFilteredGenerations(generations: Generation[], selectedGenerationIds: string[]) {
  return useMemo(() => {
    const allGenerationIds = generations.map(g => g.id);
    const validSelectedIds = selectedGenerationIds?.filter(id => allGenerationIds.includes(id)) || [];
    
    const effectiveGenerations =
      validSelectedIds.length > 0
        ? validSelectedIds
        : allGenerationIds;

    return generations.filter(gen => effectiveGenerations.includes(gen.id));
  }, [generations, selectedGenerationIds]);
}
