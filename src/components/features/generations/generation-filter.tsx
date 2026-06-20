'use client';

import { useAppStore } from '@/store/use-app-store';
import { useGenerations } from '@/hooks/use-generations';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { useMemo } from 'react';

export function GenerationFilter() {
  const { selectedGenerationIds, setSelectedGenerationIds } = useAppStore();
  const { generations = [] } = useGenerations();
  const sortedGenerations = [...generations].sort((a, b) => a.orderIndex - b.orderIndex);

  const handleToggle = (id: string) => {
    if (selectedGenerationIds.includes(id)) {
      setSelectedGenerationIds(selectedGenerationIds.filter(f => f !== id));
    } else {
      setSelectedGenerationIds([...selectedGenerationIds, id]);
    }
  };

  const displayText = useMemo(() => {
    if (selectedGenerationIds.length === generations.length) {
      return "All Generations";
    }
    if (selectedGenerationIds.length === 1) {
      const gen = generations.find(g => g.id === selectedGenerationIds[0]);
      return gen ? gen.name : "1 Generation";
    }
    return `${selectedGenerationIds.length} Generations Selected`;
  }, [selectedGenerationIds, generations]);

  const isAllSelected = selectedGenerationIds.length === generations.length;

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
          checked={isAllSelected}
          onCheckedChange={() => {
            if (isAllSelected) {
              setSelectedGenerationIds([]);
            } else {
              setSelectedGenerationIds(generations.map(g => g.id));
            }
          }}
        >
          All Generations
        </DropdownMenuCheckboxItem>
        {sortedGenerations.map(gen => (
          <DropdownMenuCheckboxItem
            key={gen.id}
            checked={selectedGenerationIds.includes(gen.id)}
            onCheckedChange={() => handleToggle(gen.id)}
          >
            {gen.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
