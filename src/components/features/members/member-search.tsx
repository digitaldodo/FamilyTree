'use client';

import { Search } from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { Input } from '@/components/ui/input';

export function MemberSearch() {
  const { searchQuery, setSearchQuery } = useAppStore();

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        placeholder="Filter members by name or bio..."
        className="pl-9"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
}
