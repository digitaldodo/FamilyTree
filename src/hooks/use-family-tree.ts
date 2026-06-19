import { useState, useMemo, useEffect } from 'react';
import { useMembers } from './use-members';
import { useAppStore } from '@/store/use-app-store';
import { generateTreeLayout } from '@/utils/tree-layout';

export function useFamilyTree(treeId?: string) {
  const { members, isLoading, error: fetchError } = useMembers(treeId);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const generations = useAppStore(s => s.generations);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Transform members into React Flow Nodes and Edges
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    return generateTreeLayout(members, generations, isMobile);
  }, [members, generations, isMobile]);

  return {
    members,
    initialNodes,
    initialEdges,
    isLoading,
    error: fetchError || error,
  };
}
