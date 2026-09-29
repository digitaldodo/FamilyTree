import { memo } from 'react';
import { motion } from 'framer-motion';

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative pointer-events-none"
      style={{
        width: data.width,
        height: data.height,
        backgroundColor: data.isEven ? 'var(--color-muted)' : 'transparent',
      }}
    >
      <div className="absolute top-12 left-16 px-4 py-1.5 rounded-full text-xs border border-border bg-card/80 backdrop-blur-md shadow-sm opacity-80 flex items-center justify-center">
        <span className="font-semibold tracking-wider text-muted-foreground uppercase">
          {data.label}
        </span>
      </div>
      
      {/* Subtle dashed line separator between generations */}
      <div className="absolute bottom-0 left-0 right-0 h-px border-b border-dashed border-border/40" />
    </motion.div>
  );
}

export const GenerationLaneNode = memo(GenerationLaneNodeComponent);
