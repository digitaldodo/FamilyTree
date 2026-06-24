import * as React from 'react';
import { useReactFlow } from '@xyflow/react';
import { ZoomIn, ZoomOut, Maximize, Plus, Wrench, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/use-app-store';
import { ShareTreeButton } from './share-tree-button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface TreeToolbarProps {
  readOnly?: boolean;
  treeId?: string;
  isPublic?: boolean;
}

export function TreeToolbar({ readOnly = false, treeId, isPublic = false }: TreeToolbarProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { setIsMemberModalOpen, setSelectedMemberId, setIsEditingMember, activeTreeId } = useAppStore();
  const resolvedTreeId = treeId || activeTreeId || '';
  const queryClient = useQueryClient();

  const handleAdd = () => {
    setSelectedMemberId(null);
    setIsEditingMember(true);
    setIsMemberModalOpen(true);
  };

  const repairMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/trees/${resolvedTreeId}/repair`, { method: 'POST' });
      let data;
    try {
      data = await res.json();
    } catch {
      throw new Error("Server returned invalid response");
    }
      if (!res.ok) throw new Error(data.message || 'Unknown error');
      return data.data;
    },
    onSuccess: (data) => {
      toast.success(`Repaired ${data?.repaired || 0} relationships! Please reload the page to see changes.`);
      queryClient.invalidateQueries({ queryKey: ['tree', resolvedTreeId] });
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(`Repair failed: ${error.message}`);
    }
  });

  const handleRepair = () => {
    if (!resolvedTreeId) return;
    if (!window.confirm("Run tree relationship repair? This will automatically link children to both spouses where links are missing.")) return;
    
    repairMutation.mutate();
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!readOnly && (
        <>
          <Button 
            className="rounded-xl shadow-sm h-10 px-4" 
            onClick={handleAdd} 
            title="Add Member"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add Member</span>
          </Button>
          
          <ShareTreeButton treeId={resolvedTreeId} isPublic={isPublic} />
          
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-xl h-10 w-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md" 
            onClick={handleRepair} 
            disabled={repairMutation.isPending} 
            title="Settings / Repair Relationships"
          >
            {repairMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wrench className="h-4 w-4 text-slate-600 dark:text-slate-300" />}
          </Button>
          <div className="h-6 w-px bg-border/50 mx-1 hidden sm:block" />
        </>
      )}
      
      <div className="flex items-center gap-1 p-1 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-800/50 rounded-2xl shadow-sm">
        <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => zoomIn({ duration: 300 })} title="Zoom In">
          <ZoomIn className="h-4 w-4 text-slate-600 dark:text-slate-300" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => zoomOut({ duration: 300 })} title="Zoom Out">
          <ZoomOut className="h-4 w-4 text-slate-600 dark:text-slate-300" />
        </Button>
        <div className="h-4 w-px bg-border/50 mx-0.5" />
        <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => fitView({ duration: 500, padding: 0.2, maxZoom: 1 })} title="Fit View">
          <Maximize className="h-4 w-4 text-slate-600 dark:text-slate-300" />
        </Button>
      </div>
    </div>
  );
}
