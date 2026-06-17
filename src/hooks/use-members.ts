'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { MemberWithRelations } from '@/types/member';

export function useMembers(treeId?: string) {
  const { members, setMembers, activeTreeId } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resolvedTreeId = treeId || activeTreeId;

  useEffect(() => {
    let isMounted = true;

    const fetchMembers = async () => {
      if (!resolvedTreeId) {
        setMembers([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch(`/api/trees/${resolvedTreeId}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to load members');
        }

        if (isMounted) {
          // The tree endpoint returns members with relations
          const treeMembers: MemberWithRelations[] = (data.data.members || []).map((m: any) => ({
            ...m,
            relationsFrom: m.relationsFrom || [],
            relationsTo: m.relationsTo || [],
          }));
          setMembers(treeMembers);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load members');
          setMembers([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchMembers();

    return () => {
      isMounted = false;
    };
  }, [resolvedTreeId, setMembers]);

  const fetchMembersManual = async () => {
    if (!resolvedTreeId) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/trees/${resolvedTreeId}`);
      const data = await res.json();
      if (res.ok && data.success) {
        const treeMembers: MemberWithRelations[] = (data.data.members || []).map((m: any) => ({
          ...m,
          relationsFrom: m.relationsFrom || [],
          relationsTo: m.relationsTo || [],
        }));
        setMembers(treeMembers);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleRefresh = () => fetchMembersManual();
    window.addEventListener('refresh-members', handleRefresh);
    return () => window.removeEventListener('refresh-members', handleRefresh);
  }, [resolvedTreeId]);

  return { members, isLoading, error, fetchMembers: fetchMembersManual };
}
