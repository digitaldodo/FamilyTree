'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store/use-app-store';
import { MemberWithRelations, Generation } from '@/types/member';
import { useEffect, useMemo } from 'react';

export function useMembers(treeId?: string) {
  const activeTreeId = useAppStore(s => s.activeTreeId);
  const resolvedTreeId = treeId || activeTreeId;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tree', resolvedTreeId],
    queryFn: async () => {
      const res = await fetch(`/api/trees/${resolvedTreeId}?t=${Date.now()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to load tree data');
      }
      return json.data;
    },
    enabled: !!resolvedTreeId,
  });

  const members: MemberWithRelations[] = useMemo(() => {
    const safeMembers = Array.isArray(data?.members) ? data.members : [];
    return safeMembers.map((m: any) => ({
      ...m,
      relationsFrom: Array.isArray(m.relationsFrom) ? m.relationsFrom : [],
      relationsTo: Array.isArray(m.relationsTo) ? m.relationsTo : [],
    }));
  }, [data]);

  const generations: Generation[] = useMemo(() => {
    return Array.isArray(data?.generations) ? data.generations : [];
  }, [data]);

  // Handled entirely by React Query now. No duplicate state in Zustand.

  // Handle manual refresh
  useEffect(() => {
    const handleRefresh = () => refetch();
    window.addEventListener('refresh-members', handleRefresh);
    return () => window.removeEventListener('refresh-members', handleRefresh);
  }, [refetch]);

  return { members, generations, isLoading, error: error?.message || null, fetchMembers: refetch };
}
