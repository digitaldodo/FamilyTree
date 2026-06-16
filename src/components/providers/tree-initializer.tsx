'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/use-app-store';

export function TreeInitializer() {
  const { userTrees, setUserTrees, activeTreeId, setActiveTreeId, setUserRole } = useAppStore();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    async function loadTrees() {
      try {
        const res = await fetch('/api/trees', { cache: 'no-store' });
        const data = await res.json();
        
        if (data.success && data.data) {
          const trees = data.data;
          setUserTrees(trees);
          
          if (trees.length > 0) {
            // Restore role if tree exists
            if (activeTreeId) {
              const activeTree = trees.find((t: any) => t.id === activeTreeId);
              if (activeTree) {
                setUserRole(activeTree.role);
              } else {
                // If the stored tree isn't found, default to the first one
                setActiveTreeId(trees[0].id);
                setUserRole(trees[0].role);
              }
            } else {
              // No active tree stored, set to first one
              setActiveTreeId(trees[0].id);
              setUserRole(trees[0].role);
            }
          } else {
            setActiveTreeId(null);
            setUserRole(null);
          }
        }
      } catch (error) {
        console.error('Failed to load trees:', error);
      }
    }

    loadTrees();
  }, [activeTreeId, setActiveTreeId, setUserRole, setUserTrees]);

  return null; // This is a logic-only component
}
