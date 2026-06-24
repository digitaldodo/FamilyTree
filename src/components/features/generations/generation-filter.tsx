'use client';

import { useAppStore } from '@/store/use-app-store';
import { useGenerations } from '@/hooks/use-generations';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

export function GenerationFilter() {
  const { selectedGenerationIds, setSelectedGenerationIds } = useAppStore();
  const { generations = [] } = useGenerations();
  const sortedGenerations = [...generations].sort((a, b) => a.orderIndex - b.orderIndex);

  const allGenerationIds = sortedGenerations.map(g => g.id);
  const selectedIds = selectedGenerationIds.filter(id => allGenerationIds.includes(id));
  const isAllSelected = selectedIds.length === 0 || selectedIds.length === allGenerationIds.length;

  const commitSelectedIds = (ids: string[]) => {
    const uniqueIds = Array.from(new Set(ids)).filter(id => allGenerationIds.includes(id));
    setSelectedGenerationIds(uniqueIds.length === allGenerationIds.length ? [] : uniqueIds);
  };

  const handleToggle = (id: string, checked: boolean) => {
    const currentIds = isAllSelected ? allGenerationIds : selectedIds;
    const nextIds = checked
      ? [...currentIds, id]
      : currentIds.filter(selectedId => selectedId !== id);
    commitSelectedIds(nextIds);
  };

  const displayText = (() => {
    if (isAllSelected) {
      return "All Generations";
    }
    if (selectedIds.length === 1) {
      const gen = generations.find(g => g.id === selectedIds[0]);
      return gen ? gen.name : "1 Generation";
    }
    return `${selectedIds.length} Generations Selected`;
  })();

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
            setSelectedGenerationIds([]);
          }}
        >
          All Generations
        </DropdownMenuCheckboxItem>
        {sortedGenerations.map(gen => (
          <DropdownMenuCheckboxItem
            key={gen.id}
            checked={isAllSelected || selectedIds.includes(gen.id)}
            onCheckedChange={(checked) => handleToggle(gen.id, Boolean(checked))}
          >
            {gen.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
