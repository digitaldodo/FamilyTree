'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store/use-app-store';
import { MemberWithRelations } from '@/types/member';
import { useEffect } from 'react';

export function useMembers(treeId?: string) {
  const { activeTreeId, setMembers, setGenerations } = useAppStore();
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

  const safeMembers = Array.isArray(data?.members) ? data.members : [];
  const members: MemberWithRelations[] = safeMembers.map((m: any) => ({
    ...m,
    relationsFrom: Array.isArray(m.relationsFrom) ? m.relationsFrom : [],
    relationsTo: Array.isArray(m.relationsTo) ? m.relationsTo : [],
  }));

  const generations = Array.isArray(data?.generations) ? data.generations : [];

  // Sync to zustand for components using getState() or direct store access
  useEffect(() => {
    if (members.length >= 0) {
      setMembers(members);
    }
    if (generations.length > 0 || (data && data.generations)) {
      setGenerations(generations);
    }
  }, [members, generations, setMembers, setGenerations, data]);

  // Handle manual refresh
  useEffect(() => {
    const handleRefresh = () => refetch();
    window.addEventListener('refresh-members', handleRefresh);
    return () => window.removeEventListener('refresh-members', handleRefresh);
  }, [refetch]);

  return { members, isLoading, error: error?.message || null, fetchMembers: refetch };
}
