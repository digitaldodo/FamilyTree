"use client";

import { Panel } from '@xyflow/react';
import { useMembers } from '@/hooks/use-members';
import { useAppStore } from '@/store/use-app-store';

const GENERATION_COLORS = [
  'bg-amber-500',
  'bg-indigo-500',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-purple-500',
  'bg-orange-500',
];

export function GenerationLegend() {
  const { members, generations } = useMembers();

  const sortedGens = [...generations].sort((a, b) => a.orderIndex - b.orderIndex);

  if (sortedGens.length === 0) return null;

  return (
    <Panel position="bottom-right">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/20 dark:border-slate-800/50">
        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Generations
        </h4>
        <div className="space-y-2">
          {sortedGens.map((gen, idx) => {
            const count = members.filter(m => m.generationId === gen.id).length;
            return (
              <div key={gen.id} className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${GENERATION_COLORS[idx % GENERATION_COLORS.length]} shadow-sm`}
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Gen {idx + 1} · {gen.name}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}
