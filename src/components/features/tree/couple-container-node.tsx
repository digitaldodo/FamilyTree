'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Handle, Position } from '@xyflow/react';
import { MemberWithRelations } from '@/types/member';
import { MemberAvatar } from '../members/member-avatar';

interface CoupleContainerNodeProps {
  data: {
    members: MemberWithRelations[];
    generationName?: string;
  };
}

function CoupleContainerNodeComponent({ data }: CoupleContainerNodeProps) {
  const { members, generationName } = data;

  if (!members || members.length !== 2) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="relative flex items-center gap-6 p-4 rounded-[32px] bg-white/70 dark:bg-slate-950/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl"
    >
      <Handle type="target" position={Position.Top} id="child-target" className="w-4 h-4 bg-purple-500 border-2 border-background" />
      <div className="grid grid-cols-2 gap-5 w-full">
        {members.map((member) => (
          <div key={member.id} className="relative min-w-[180px] rounded-3xl bg-slate-950/5 dark:bg-white/5 border border-white/10 p-4 flex flex-col items-center gap-3 shadow-sm">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-900">
              <MemberAvatar
                imageUrl={member.imageUrl}
                firstName={member.firstName}
                lastName={member.lastName}
                gender={member.gender}
                fallbackSize={36}
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground truncate">
                {member.firstName} {member.lastName}
              </p>
              <p className="text-[11px] text-muted-foreground uppercase tracking-[0.2em] mt-1">
                {generationName || 'Couple'}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-rose-500 shadow-xl border-4 border-background">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>
      <Handle type="source" position={Position.Bottom} id="parent-source" className="w-4 h-4 bg-purple-500 border-2 border-background" />
    </motion.div>
  );
}

export const CoupleContainerNode = memo(CoupleContainerNodeComponent);
