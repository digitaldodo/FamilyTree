'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/store/use-app-store';

export function MemberFilter() {
  const { generations, generationFilter, setGenerationFilter } = useAppStore();
  const sortedGenerations = [...generations].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="flex flex-col md:flex-row gap-2 items-center w-full md:w-auto">
      <Select value={generationFilter} onValueChange={setGenerationFilter}>
        <SelectTrigger className="w-full md:w-[160px]">
          <SelectValue placeholder="Filter by generation" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Generations</SelectItem>
          {sortedGenerations.map(gen => (
            <SelectItem key={gen.id} value={gen.id}>{gen.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select defaultValue="name">
        <SelectTrigger className="w-full md:w-[140px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">Sort: Name</SelectItem>
          <SelectItem value="age">Sort: Age</SelectItem>
          <SelectItem value="recent">Sort: Recent</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
