import { useMemo } from 'react';
import { Generation } from '@/types/member';

export function useFilteredGenerations(generations: Generation[], selectedGenerationIds: string[]) {
  return useMemo(() => {
    if (!selectedGenerationIds || selectedGenerationIds.length === 0) return generations;
    return generations.filter(gen => selectedGenerationIds.includes(gen.id));
  }, [generations, selectedGenerationIds]);
}
