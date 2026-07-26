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
        background: data.isEven ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)'
      }}
    >
      <div className="absolute top-8 left-12 px-3 py-1 rounded-full text-xs backdrop-blur-sm border border-white/10 bg-white/10 flex items-center justify-center shadow-sm">
        <span className="font-medium tracking-wide text-foreground/80">
          {data.label}
        </span>
      </div>
    </motion.div>
  );
}

export const GenerationLaneNode = memo(GenerationLaneNodeComponent);
