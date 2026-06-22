'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { useUserTrees } from '@/hooks/use-user-trees';

export function TreeInitializer() {
  const { activeTreeId, setActiveTreeId, setIsInitializingTrees } = useAppStore();
  const { userTrees, isLoading } = useUserTrees();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (isLoading) {
      setIsInitializingTrees(true);
    } else {
      setIsInitializingTrees(false);
      
      if (userTrees && !hasInitialized.current) {
        hasInitialized.current = true;
        if (userTrees.length > 0) {
          if (activeTreeId) {
            const activeTree = userTrees.find((t) => t.id === activeTreeId);
            if (!activeTree) {
              setActiveTreeId(userTrees[0].id);
            }
          } else {
            setActiveTreeId(userTrees[0].id);
          }
        } else {
          setActiveTreeId(null);
        }
      }
    }
  }, [isLoading, userTrees, activeTreeId, setActiveTreeId, setIsInitializingTrees]);

  return null; // This is a logic-only component
}
