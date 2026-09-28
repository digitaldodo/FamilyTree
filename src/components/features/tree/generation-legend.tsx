'use client';

import { Panel } from '@xyflow/react';
import { useMembers } from '@/hooks/use-members';

const GENERATION_COLORS = [
  'bg-amber-500',
  'bg-indigo-500',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-primary',
  'bg-orange-500',
];

export function GenerationLegend() {
  const { members, generations } = useMembers();

  const sortedGens = [...generations].sort(
    (a, b) => a.orderIndex - b.orderIndex
  );

  if (sortedGens.length === 0) return null;

  return (
    <Panel position="bottom-right">
      <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Generations
        </h4>
        <div className="space-y-2">
          {sortedGens.map((gen, idx) => {
            const count = members.filter(
              (m) => m.generationId === gen.id
            ).length;
            return (
              <div key={gen.id} className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${GENERATION_COLORS[idx % GENERATION_COLORS.length]} shadow-sm`}
                />
                <span className="text-sm font-medium text-foreground">
                  Gen {idx + 1} · {gen.name}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
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
