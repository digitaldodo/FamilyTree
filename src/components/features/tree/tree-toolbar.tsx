import { useReactFlow } from '@xyflow/react';
import { ZoomIn, ZoomOut, Maximize, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/use-app-store';
import { ShareTreeButton } from './share-tree-button';

interface TreeToolbarProps {
  readOnly?: boolean;
  treeId?: string;
  isPublic?: boolean;
}

export function TreeToolbar({ readOnly = false, treeId, isPublic = false }: TreeToolbarProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { setIsMemberModalOpen, setSelectedMemberId, setIsEditingMember, activeTreeId } = useAppStore();
  const resolvedTreeId = treeId || activeTreeId || '';

  const handleAdd = () => {
    setSelectedMemberId(null);
    setIsEditingMember(true);
    setIsMemberModalOpen(true);
  };

  return (
    <div className="absolute top-6 right-6 z-10 flex flex-row items-center gap-1.5 p-1.5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-800/50 rounded-2xl shadow-xl">
      {!readOnly && (
        <>
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
          </Button>
          <ShareTreeButton treeId={resolvedTreeId} isPublic={isPublic} />
          <div className="h-6 w-px bg-border/50 mx-1" />
        </>
      )}
      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => zoomIn({ duration: 300 })}>
        <ZoomIn className="h-4 w-4 text-slate-600 dark:text-slate-300" />
      </Button>
      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => zoomOut({ duration: 300 })}>
        <ZoomOut className="h-4 w-4 text-slate-600 dark:text-slate-300" />
      </Button>
      <div className="h-6 w-px bg-border/50 mx-1" />
      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => fitView({ duration: 500, padding: 0.2, maxZoom: 1 })}>
        <Maximize className="h-4 w-4 text-slate-600 dark:text-slate-300" />
      </Button>
    </div>
  );
}
