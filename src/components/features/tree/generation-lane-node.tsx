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
      className={cn(
        "relative rounded-[40px] border border-border/40 pointer-events-none transition-colors",
        data.isEven ? "bg-primary/5 dark:bg-primary/5" : "bg-transparent"
      )}
      style={{
        width: data.width,
        height: data.height,
      }}
    >
      <div className="absolute top-8 left-12 px-6 py-2 rounded-2xl bg-background/80 backdrop-blur-md border border-border/50 shadow-md">
        <span className="text-sm font-bold tracking-widest text-primary/80 uppercase">
          {data.label}
        </span>
      </div>
    </div>
  );
}

export const GenerationLaneNode = memo(GenerationLaneNodeComponent);
