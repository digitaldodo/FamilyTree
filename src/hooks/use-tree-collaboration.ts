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
    const currentPendingChanges = useAppStore.getState().pendingChanges;
    const currentHasConflict = useAppStore.getState().hasConflict;

    if (currentPendingChanges.length === 0 || isSyncing || currentHasConflict || !treeId) return true;

    const validEvents = currentPendingChanges.filter(e => e && typeof e === 'object' && e.type && e.payload);
    
    if (validEvents.length === 0) {
      if (currentPendingChanges.length > 0) clearPendingChanges();
      return true;
    }

    setIsSyncing(true);
    try {
      const res = await fetch(`/api/trees/${treeId}/collaborate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          versionId,
          events: validEvents
        })
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON response from server");
      }
      if (!res.ok || !data.success) {
        if (data.conflict) {
           setHasConflict(true);
           toast.error('Conflict detected with another user. Please refresh.');
        } else {
           toast.error(data.message || 'Sync failed');
        }
        return false;
      } else {
        clearPendingChanges();
        queryClient.invalidateQueries({ queryKey: ['tree', treeId] });
        return true;
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sync changes');
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [pendingChanges, isSyncing, treeId, versionId, hasConflict, queryClient, clearPendingChanges, setHasConflict]);

  return {
    pendingChanges,
    isSyncing,
    hasConflict,
    syncChanges
  };
}
