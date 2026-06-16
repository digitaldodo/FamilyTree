'use client';

import { TreePine, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';

interface TreeListEmptyProps {
  onCreateTree: () => void;
}

export function TreeListEmpty({ onCreateTree }: TreeListEmptyProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center text-center py-20 px-6 relative"
    >
      {/* Subtle gradient background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px] pointer-events-none -z-10" />

      {/* Icon in gradient circle */}
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-purple-400/20 flex items-center justify-center mb-8 ring-1 ring-primary/10">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
          <TreePine className="w-8 h-8 text-white" />
        </div>
      </div>

      <h2 className="text-2xl font-bold tracking-tight mb-3">
        Start Your Family Legacy
      </h2>
      <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
        Create your first family tree to begin preserving your family&apos;s history, memories, and connections.
      </p>

      <Button size="lg" onClick={onCreateTree} className="h-12 px-8 text-base">
        <Plus className="w-5 h-5 mr-2" />
        Create Your First Tree
      </Button>
    </motion.div>
  );
}
