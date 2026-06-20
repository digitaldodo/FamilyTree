import { useMemo } from 'react';
import { Generation } from '@/types/member';

export function useFilteredGenerations(generations: Generation[], selectedGenerationIds: string[]) {
  return useMemo(() => {
    const allGenerationIds = generations.map(g => g.id);
    const effectiveGenerations =
      selectedGenerationIds?.length > 0
        ? selectedGenerationIds
        : allGenerationIds;

    return generations.filter(gen => effectiveGenerations.includes(gen.id));
  }, [generations, selectedGenerationIds]);
}
