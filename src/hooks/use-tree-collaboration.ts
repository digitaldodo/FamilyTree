import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAppStore } from '@/store/use-app-store';

export function useTreeCollaboration(treeId: string | null, versionId: string | null) {
  const queryClient = useQueryClient();
  const pendingChanges = useAppStore(s => s.pendingChanges);
  const clearPendingChanges = useAppStore(s => s.clearPendingChanges);
  const hasConflict = useAppStore(s => s.hasConflict);
  const setHasConflict = useAppStore(s => s.setHasConflict);
  const [isSyncing, setIsSyncing] = useState(false);

  const syncChanges = useCallback(async () => {
    if (pendingChanges.length === 0 || isSyncing || hasConflict || !treeId) return;

    setIsSyncing(true);
    try {
      const res = await fetch(`/api/trees/${treeId}/collaborate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          versionId,
          events: pendingChanges
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.conflict) {
           setHasConflict(true);
           toast.error('Conflict detected with another user. Please refresh.');
        } else {
           throw new Error(data.message || 'Sync failed');
        }
      } else {
        clearPendingChanges();
        queryClient.invalidateQueries({ queryKey: ['tree', treeId] });
        window.dispatchEvent(new Event('refresh-members'));
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sync changes');
    } finally {
      setIsSyncing(false);
    }
  }, [pendingChanges, isSyncing, treeId, versionId, hasConflict, queryClient, clearPendingChanges, setHasConflict]);

  // Auto-sync every 3 seconds if there are pending changes
  useEffect(() => {
    const timer = setInterval(() => {
      syncChanges();
    }, 3000);
    return () => clearInterval(timer);
  }, [syncChanges]);

  return {
    pendingChanges,
    isSyncing,
    hasConflict,
    syncChanges
  };
}
