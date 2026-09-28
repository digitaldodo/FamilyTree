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
        background: data.isEven ? 'var(--muted)' : 'transparent',
        opacity: 0.1,
      }}
    >
      <div className="absolute top-8 left-12 px-3 py-1 rounded-md text-xs border border-border bg-card flex items-center justify-center shadow-sm">
        <span className="font-medium tracking-wide text-foreground">
          {data.label}
        </span>
      </div>
    </motion.div>
  );
}

export const GenerationLaneNode = memo(GenerationLaneNodeComponent);
