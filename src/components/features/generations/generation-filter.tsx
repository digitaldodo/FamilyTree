'use client';

import { useAppStore } from '@/store/use-app-store';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { useMemo } from 'react';

export function GenerationFilter() {
  const { generations, generationFilters, setGenerationFilters } = useAppStore();
  const sortedGenerations = [...generations].sort((a, b) => a.orderIndex - b.orderIndex);

  const handleToggle = (id: string) => {
    if (generationFilters.length === 0) {
      // If currently all are selected (empty filter), and user clicks one,
      // it means they want to unselect it. So we select all EXCEPT this one.
      const allIds = sortedGenerations.map(g => g.id);
      setGenerationFilters(allIds.filter(genId => genId !== id));
    } else {
      if (generationFilters.includes(id)) {
        const nextFilters = generationFilters.filter(f => f !== id);
        setGenerationFilters(nextFilters);
      } else {
        const nextFilters = [...generationFilters, id];
        if (nextFilters.length === generations.length) {
          setGenerationFilters([]); // reset to all
        } else {
          setGenerationFilters(nextFilters);
        }
      }
    }
  };

  const displayText = useMemo(() => {
    if (generationFilters.length === 0 || generationFilters.length === generations.length) {
      return "All Generations";
    }
    if (generationFilters.length === 1) {
      const gen = generations.find(g => g.id === generationFilters[0]);
      return gen ? gen.name : "1 Generation";
    }
    return `${generationFilters.length} Generations Selected`;
  }, [generationFilters, generations]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full md:w-auto min-w-[180px] justify-between">
          <span className="flex items-center gap-2 text-sm font-normal">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {displayText}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px]">
        <DropdownMenuCheckboxItem
          checked={generationFilters.length === 0}
          onCheckedChange={() => setGenerationFilters([])}
        >
          All Generations
        </DropdownMenuCheckboxItem>
        {sortedGenerations.map(gen => (
          <DropdownMenuCheckboxItem
            key={gen.id}
            checked={generationFilters.length === 0 || generationFilters.includes(gen.id)}
            onCheckedChange={() => handleToggle(gen.id)}
          >
            {gen.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
