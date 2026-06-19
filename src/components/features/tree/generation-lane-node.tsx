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
    <div className="relative pointer-events-none">
      <div className="absolute top-1/2 -translate-y-1/2 left-0 px-6 py-2 rounded-2xl bg-background/80 backdrop-blur-md border border-border/50 shadow-md">
        <span className="text-sm font-bold tracking-widest text-primary/80 uppercase">
          {data.label}
        </span>
      </div>
    </div>
  );
}

export const GenerationLaneNode = memo(GenerationLaneNodeComponent);
