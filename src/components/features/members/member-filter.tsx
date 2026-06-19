'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GenerationFilter } from '@/components/features/generations/generation-filter';

export function MemberFilter() {
  return (
    <div className="flex flex-col md:flex-row gap-2 items-center w-full md:w-auto">
      <GenerationFilter />
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
