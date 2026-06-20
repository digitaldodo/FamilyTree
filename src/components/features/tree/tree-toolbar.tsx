import * as React from 'react';
import { useReactFlow } from '@xyflow/react';
import { ZoomIn, ZoomOut, Maximize, Plus, Wrench, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/use-app-store';
import { ShareTreeButton } from './share-tree-button';
import { GenerationFilter } from '@/components/features/generations/generation-filter';

interface TreeToolbarProps {
  readOnly?: boolean;
  treeId?: string;
  isPublic?: boolean;
}

export function TreeToolbar({ readOnly = false, treeId, isPublic = false }: TreeToolbarProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { setIsMemberModalOpen, setSelectedMemberId, setIsEditingMember, activeTreeId } = useAppStore();
  const resolvedTreeId = treeId || activeTreeId || '';
  const [isRepairing, setIsRepairing] = React.useState(false);

  const handleAdd = () => {
    setSelectedMemberId(null);
    setIsEditingMember(true);
    setIsMemberModalOpen(true);
  };

  const handleRepair = async () => {
    alert("Repair function is temporarily disabled during the architecture freeze.");
    return;
    if (!resolvedTreeId) return;
    if (!window.confirm("Run tree relationship repair? This will automatically link children to both spouses where links are missing.")) return;
    
    try {
      setIsRepairing(true);
      const res = await fetch(`/api/trees/${resolvedTreeId}/repair`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert(`Repaired ${data.data?.repaired || 0} relationships! Please reload the page to see changes.`);
      } else {
        alert(`Repair failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(error);
      alert('Repair failed due to network error.');
    } finally {
      setIsRepairing(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-800/50 rounded-2xl shadow-xl w-full md:w-auto">
      <div className="mr-1">
        <GenerationFilter />
      </div>
      <div className="h-6 w-px bg-border/50 mx-1" />
      {!readOnly && (
        <>
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary" onClick={handleAdd} title="Add Member">
            <Plus className="h-4 w-4" />
          </Button>
          <ShareTreeButton treeId={resolvedTreeId} isPublic={isPublic} />
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-amber-500/10 hover:text-amber-500" onClick={handleRepair} disabled={isRepairing} title="Repair Relationships">
            {isRepairing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wrench className="h-4 w-4" />}
          </Button>
          <div className="h-6 w-px bg-border/50 mx-1" />
        </>
      )}
      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => zoomIn({ duration: 300 })} title="Zoom In">
        <ZoomIn className="h-4 w-4 text-slate-600 dark:text-slate-300" />
      </Button>
      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => zoomOut({ duration: 300 })} title="Zoom Out">
        <ZoomOut className="h-4 w-4 text-slate-600 dark:text-slate-300" />
      </Button>
      <div className="h-6 w-px bg-border/50 mx-1" />
      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => fitView({ duration: 500, padding: 0.2, maxZoom: 1 })} title="Fit View">
        <Maximize className="h-4 w-4 text-slate-600 dark:text-slate-300" />
      </Button>
    </div>
  );
}
