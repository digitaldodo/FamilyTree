'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Handle, Position } from '@xyflow/react';

function FamilyJunctionNodeComponent() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="relative flex items-center justify-center w-4 h-4"
    >
      {/* Target handle for incoming parent connections */}
      <Handle 
        type="target" 
        position={Position.Top} 
        id="junction-target"
        className="opacity-0 w-1 h-1 pointer-events-none" 
      />

      {/* The visible dot */}
      <div className="w-2 h-2 rounded-full bg-purple-500 shadow-sm ring-2 ring-background z-10" />

      {/* Source handle for outgoing child connections */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="junction-source"
        className="opacity-0 w-1 h-1 pointer-events-none" 
      />
    </motion.div>
  );
}

export const FamilyJunctionNode = memo(FamilyJunctionNodeComponent);
