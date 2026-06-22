'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store/use-app-store';
import { MemberWithRelations, Generation } from '@/types/member';
import { useEffect, useMemo } from 'react';

export function useMembers(treeId?: string) {
  const activeTreeId = useAppStore(s => s.activeTreeId);
  const selectedTreeVersionId = useAppStore(s => s.selectedTreeVersionId);
  const resolvedTreeId = treeId || activeTreeId;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tree', activeTreeId],
    queryFn: async () => {
      const endpoint = selectedTreeVersionId 
        ? `/api/treeVersion/${selectedTreeVersionId}` 
        : `/api/trees/${resolvedTreeId}`;
        
      const res = await fetch(endpoint);
      let json;
    try {
      json = await res.json();
    } catch {
      throw new Error("Server returned invalid response");
    }
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to load tree data');
      }
      return json.data;
    },
    enabled: !!resolvedTreeId,
  });

  const members: MemberWithRelations[] = useMemo(() => {
    const safeMembers = Array.isArray(data?.members) ? data.members : (Array.isArray(data?.membersData) ? data.membersData : []);
    return safeMembers.map((m: any) => ({
      ...m,
      relationsFrom: Array.isArray(m.relationsFrom) ? m.relationsFrom : [],
      relationsTo: Array.isArray(m.relationsTo) ? m.relationsTo : [],
    }));
  }, [data]);

  const generations: Generation[] = useMemo(() => {
    return Array.isArray(data?.generations) ? data.generations : (Array.isArray(data?.gensData) ? data.gensData : []);
  }, [data]);

  // Handled entirely by React Query now. No duplicate state in Zustand.

  return { members, generations, isLoading, error: error?.message || null, fetchMembers: refetch };
}
