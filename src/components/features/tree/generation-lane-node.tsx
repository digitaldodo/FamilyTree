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
      className="relative pointer-events-none"
      style={{
        width: data.width,
        height: data.height,
      }}
    >
      <div className="absolute top-8 left-12 px-3 py-1 rounded-full text-xs backdrop-blur-sm border border-white/10 bg-white/5 flex items-center justify-center">
        <span className="font-medium tracking-wide text-foreground/80">
          {data.label}
        </span>
      </div>
    </div>
  );
}

export const GenerationLaneNode = memo(GenerationLaneNodeComponent);
