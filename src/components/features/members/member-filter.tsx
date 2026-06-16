'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/store/use-app-store';

export function MemberFilter() {
  return (
    <div className="flex gap-2 items-center">
      <Select defaultValue="all">
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Filter by generation" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Generations</SelectItem>
          <SelectItem value="1">Generation 1</SelectItem>
          <SelectItem value="2">Generation 2</SelectItem>
          <SelectItem value="3">Generation 3</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue="name">
        <SelectTrigger className="w-[140px]">
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
