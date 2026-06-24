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
      className="flex flex-wrap items-center gap-4 w-full md:w-auto"
    >
      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
        <Users className="w-4 h-4" />
        <span className="text-sm font-medium">
          {totalMembers} <span className="text-xs opacity-80">Members</span>
        </span>
      </div>

      <div className="h-4 w-px bg-border/50 hidden md:block" />

      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
        <Heart className="w-4 h-4" />
        <span className="text-sm font-medium">
          {generations} <span className="text-xs opacity-80">Generations</span>
        </span>
      </div>
    </motion.div>
  );
}
