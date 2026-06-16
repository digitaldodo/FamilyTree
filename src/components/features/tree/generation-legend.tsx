"use client";

import { motion } from 'framer-motion';
import { scaleIn } from '@/utils/animations';

const generations = [
  { label: 'Grandparents', color: 'bg-amber-500' },
  { label: 'Parents', color: 'bg-indigo-500' },
  { label: 'Children', color: 'bg-emerald-500' },
  { label: 'Default', color: 'bg-slate-400' },
];

export function GenerationLegend() {
  return (
    <motion.div
      variants={scaleIn}
      initial="initial"
      animate="animate"
      className="absolute bottom-6 right-6 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/20 dark:border-slate-800/50"
    >
      <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
        Generations
      </h4>
      <div className="space-y-2">
        {generations.map((gen) => (
          <div key={gen.label} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${gen.color} shadow-sm`} />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {gen.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
