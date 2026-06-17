import { memo } from 'react';
import { cn } from '@/lib/utils';

interface GenerationLaneNodeProps {
  data: {
    label: string;
    width: number;
    height: number;
    isEven: boolean;
  };
}

function GenerationLaneNodeComponent({ data }: GenerationLaneNodeProps) {
  return (
    <div
      style={{ width: data.width, height: data.height }}
      className={cn(
        "relative flex flex-col justify-start border-t border-border/40 pointer-events-none",
        data.isEven ? "bg-black/5 dark:bg-white/5" : "bg-transparent"
      )}
    >
      <div className="absolute top-4 left-8 px-4 py-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-sm">
        <span className="text-sm font-semibold tracking-wide text-foreground/80 uppercase">
          {data.label}
        </span>
      </div>
    </div>
  );
}

export const GenerationLaneNode = memo(GenerationLaneNodeComponent);
