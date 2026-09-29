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

export function TreeToolbar({
  readOnly = false,
  treeId,
  isPublic = false,
}: TreeToolbarProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const {
    setIsMemberModalOpen,
    setSelectedMemberId,
    setIsEditingMember,
    activeTreeId,
  } = useAppStore();
  const resolvedTreeId = treeId || activeTreeId || '';
  const queryClient = useQueryClient();

  const handleAdd = () => {
    setSelectedMemberId(null);
    setIsEditingMember(true);
    setIsMemberModalOpen(true);
  };

  const repairMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/trees/${resolvedTreeId}/repair`, {
        method: 'POST',
      });
      let _data;
      try {
        _data = await res.json();
      } catch {
        throw new Error('Server returned invalid response');
      }
      if (!res.ok) throw new Error(_data.message || 'Unknown error');
      return _data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tree', resolvedTreeId] });
    },
  });

  const handleRepair = () => {
    if (!resolvedTreeId) return;
    if (
      !window.confirm(
        'Run tree relationship repair? This will safely fix duplicates and sync parents.'
      )
    )
      return;

    toast.promise(repairMutation.mutateAsync(), {
      loading: 'Checking family relationships...',
      success: (data) => {
        if (!data?.repaired || data.repaired === 0) {
          return 'No relationship issues found.';
        }
        return `Repaired ${data.repaired} relationships successfully.`;
      },
      error: (err) =>
        `Unable to repair relationships: ${err.message || 'Please try again.'}`,
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
      {/* Primary & Secondary Actions */}
      {!readOnly && (
        <div className="flex items-center gap-2 bg-card/80 backdrop-blur-md p-1.5 rounded-xl border border-border shadow-sm">
          <Button
            className="rounded-lg h-9 px-4 shadow-sm"
            onClick={handleAdd}
            title="Add Member"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="font-medium">Add Member</span>
          </Button>

          <div className="h-5 w-px bg-border/80 mx-1" />

          <ShareTreeButton treeId={resolvedTreeId} isPublic={isPublic} />

          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg h-9 w-9 hover:bg-muted"
            onClick={handleRepair}
            disabled={repairMutation.isPending}
            title="Repair Relationships"
          >
            {repairMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <Wrench className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      )}

      {/* Navigation / View Actions */}
      <div className="flex items-center gap-1 p-1.5 bg-card/80 backdrop-blur-md border border-border rounded-xl shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-lg h-8 w-8 hover:bg-muted"
          onClick={() => zoomIn({ duration: 300 })}
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4 text-muted-foreground" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-lg h-8 w-8 hover:bg-muted"
          onClick={() => zoomOut({ duration: 300 })}
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4 text-muted-foreground" />
        </Button>
        <div className="h-4 w-px bg-border/80 mx-0.5" />
        <Button
          variant="ghost"
          size="icon"
          className="rounded-lg h-8 w-8 hover:bg-muted"
          onClick={() => fitView({ duration: 500, padding: 0.2, maxZoom: 1 })}
          title="Fit View"
        >
          <Maximize className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}
