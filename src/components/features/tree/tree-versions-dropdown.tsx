'use client';

import { useAppStore } from '@/store/use-app-store';
import { useQuery } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { History, Check, ChevronDown } from 'lucide-react';

export function TreeVersionsDropdown() {
  const { activeTreeId, selectedTreeVersionId, setSelectedTreeVersionId } = useAppStore();

  const { data: versionsResponse } = useQuery({
    queryKey: ['tree-versions', activeTreeId],
    queryFn: async () => {
      const res = await fetch(`/api/trees/${activeTreeId}/versions`);
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON response from server");
      }
      return data;
    },
    enabled: !!activeTreeId,
  });

  const versions = versionsResponse?.data || [];

  if (versions.length === 0) return null;

  return (
    <div className="w-full md:w-64">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center justify-between w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 dark:border-slate-800/50 shadow-sm text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              <div className="flex flex-col items-start gap-0.5 text-left">
                <span className="font-semibold leading-none text-xs truncate max-w-[120px]">
                  {selectedTreeVersionId 
                    ? versions.find((v: any) => v.id === selectedTreeVersionId)?.name || 'Historical Version'
                    : 'Latest (Active)'}
                </span>
                <span className="text-[9px] text-muted-foreground leading-none">
                  {selectedTreeVersionId 
                    ? new Date(versions.find((v: any) => v.id === selectedTreeVersionId)?.createdAt).toLocaleDateString()
                    : 'Current Working State'}
                </span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground opacity-50" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[240px]">
          <DropdownMenuItem 
            onClick={() => setSelectedTreeVersionId(null)}
            className="flex items-center justify-between cursor-pointer py-2.5 px-3 rounded-md focus:bg-accent/50 transition-colors"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Latest (Active)</span>
                <span className="px-1.5 py-0.5 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] uppercase font-bold tracking-wider">Active</span>
              </div>
              <span className="text-xs text-muted-foreground">Current working version</span>
            </div>
            {!selectedTreeVersionId && <Check className="w-4 h-4 text-green-600 dark:text-green-400" />}
          </DropdownMenuItem>
          <div className="h-px bg-border/50 my-1.5 mx-2" />
          {versions.map((v: any) => (
            <DropdownMenuItem 
              key={v.id} 
              onClick={() => setSelectedTreeVersionId(v.id)}
              className="flex items-center justify-between cursor-pointer py-2.5 px-3 rounded-md focus:bg-accent/50 transition-colors"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-sm">{`${v.name || 'Snapshot'} - ${new Date(v.createdAt).toISOString().split('T')[0]}`}</span>
              </div>
              {selectedTreeVersionId === v.id && <Check className="w-4 h-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
