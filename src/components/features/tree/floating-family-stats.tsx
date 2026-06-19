"use client";

import { motion } from 'framer-motion';
import { Users, Heart } from 'lucide-react';
import { scaleIn } from '@/utils/animations';

interface FloatingFamilyStatsProps {
  totalMembers: number;
  generations: number;
}

export function FloatingFamilyStats({ totalMembers, generations }: FloatingFamilyStatsProps) {
  return (
    <motion.div
      variants={scaleIn}
      initial="initial"
      animate="animate"
      className="flex flex-wrap gap-3 w-full md:w-auto"
    >
      <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/20 dark:border-slate-800/50">
        <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-full text-indigo-600 dark:text-indigo-400">
          <Users className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-800 dark:text-white leading-none">
            {totalMembers}
          </span>
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
            Members
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/20 dark:border-slate-800/50">
        <div className="p-1.5 bg-rose-100 dark:bg-rose-900/50 rounded-full text-rose-600 dark:text-rose-400">
          <Heart className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-800 dark:text-white leading-none">
            {generations}
          </span>
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
            Generations
          </span>
        </div>
      </div>
    </motion.div>
  );
}
