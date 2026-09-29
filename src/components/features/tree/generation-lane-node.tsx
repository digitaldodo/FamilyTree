import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store/use-app-store';
import { toast } from 'sonner';
import { fetchJson } from '@/lib/fetcher';

interface GenerationLaneNodeProps {
  data: {
    label: string;
    generationId?: string;
    isEditable?: boolean;
    width: number;
    height: number;
    isEven: boolean;
  };
}

function GenerationLaneNodeComponent({ data }: GenerationLaneNodeProps) {
  const queryClient = useQueryClient();
  const activeTreeId = useAppStore((s) => s.activeTreeId);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEdit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!data.generationId) {
      toast.error('Cannot edit default generation.');
      return;
    }

    const newName = prompt('Enter new generation name:', data.label);
    if (!newName || newName.trim() === '' || newName === data.label) return;

    try {
      setIsUpdating(true);
      await fetchJson(`/api/generations/${data.generationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      toast.success('Generation renamed successfully.');
      queryClient.invalidateQueries({ queryKey: ['tree', activeTreeId] });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to rename generation.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative pointer-events-none"
      style={{
        width: data.width,
        height: data.height,
        backgroundColor: 'transparent',
      }}
    >
      <div className="absolute top-12 left-16 px-4 py-1.5 rounded-full text-xs border border-border bg-card/80 backdrop-blur-md shadow-sm opacity-80 flex items-center justify-center gap-2 group pointer-events-auto hover:opacity-100 transition-opacity">
        <span className="font-semibold tracking-wider text-muted-foreground uppercase">
          {data.label}
        </span>
        {data.generationId && data.isEditable && (
          <button
            type="button"
            onClick={handleEdit}
            disabled={isUpdating}
            className="nodrag nowheel p-1 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
            title="Rename Generation"
            aria-label={`Rename ${data.label}`}
          >
            {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export const GenerationLaneNode = memo(GenerationLaneNodeComponent);
