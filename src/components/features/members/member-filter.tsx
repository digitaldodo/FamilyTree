'use client';

import { Select } from '@/components/ui/select';
import { useAppStore } from '@/store/use-app-store';

export function MemberFilter() {
  // We can add filtering state to useAppStore if needed.
  // For Phase 4, we use a placeholder filter dropdown for Generations or Sort
  
  return (
    <div className="flex gap-2 items-center">
      <Select className="w-40" defaultValue="all">
        <option value="all">All Generations</option>
        <option value="1">Generation 1</option>
        <option value="2">Generation 2</option>
        <option value="3">Generation 3</option>
      </Select>
      <Select className="w-32" defaultValue="name">
        <option value="name">Sort: Name</option>
        <option value="age">Sort: Age</option>
        <option value="recent">Sort: Recent</option>
      </Select>
    </div>
  );
}
