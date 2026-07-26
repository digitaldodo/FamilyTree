'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store/use-app-store';
import { MemberWithRelations, Generation } from '@/types/member';
import { useMemo } from 'react';
import { fetchJson, getApiErrorMessage, isApiError } from '@/lib/fetcher';

function getTreeErrorMessage(error: unknown) {
  if (!error) return null;

  if (isApiError(error)) {
    switch (error.status) {
      case 400:
        return 'This tree link is invalid. Please choose a tree again.';
      case 401:
        return 'Your session expired. Please sign in again to view this tree.';
      case 403:
        return 'You do not have permission to view this tree.';
      case 404:
        return 'This tree could not be found. It may have been deleted or moved.';
      case 422:
        return 'This tree contains data that could not be read safely. Please repair the tree or contact support.';
      case 503:
        return 'The app is finishing a database update. Please wait a moment, then try again.';
      default:
        if (error.status >= 500) {
          return 'We could not load this tree right now. Please try again in a moment.';
        }
    }
  }

  return getApiErrorMessage(error, 'Failed to load tree data.');
}

export function useMembers(treeId?: string) {
  const activeTreeId = useAppStore(s => s.activeTreeId);
  const selectedTreeVersionId = useAppStore(s => s.selectedTreeVersionId);
  const resolvedTreeId = treeId || activeTreeId;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['tree', resolvedTreeId, selectedTreeVersionId || 'live'],
    queryFn: async () => {
      const endpoint = selectedTreeVersionId 
        ? `/api/treeVersion/${selectedTreeVersionId}` 
        : `/api/trees/${resolvedTreeId}`;

      const json = await fetchJson(endpoint);
      if (!json?.success) throw new Error(json?.message || 'Failed to load tree data');
      return json.data;
    },
    enabled: !!resolvedTreeId,
    retry: (failureCount, error) => {
      if (isApiError(error) && error.status >= 400 && error.status < 500) {
        return false;
      }

      return failureCount < 1;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000),
    throwOnError: false,
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

  return {
    members,
    generations,
    isLoading,
    isError,
    error: getTreeErrorMessage(error),
    errorStatus: isApiError(error) ? error.status : null,
    errorDetails: error,
    fetchMembers: refetch,
  };
}
