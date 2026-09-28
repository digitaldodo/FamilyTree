'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Handle, Position } from '@xyflow/react';
import { MemberWithRelations } from '@/types/member';
import { useAppStore } from '@/store/use-app-store';
import { cn } from '@/lib/utils';
import { TreeMemberCard } from './tree-member-card';

interface CoupleContainerNodeProps {
  data: {
    members: MemberWithRelations[];
    generationName?: string;
  };
}

function CoupleContainerNodeComponent({ data }: CoupleContainerNodeProps) {
  const { members, generationName } = data;
  const setSelectedMemberId = useAppStore((s) => s.setSelectedMemberId);
  const setIsMemberModalOpen = useAppStore((s) => s.setIsMemberModalOpen);
  const selectedMemberId = useAppStore((s) => s.selectedMemberId);

  if (!members || members.length !== 2) {
    return null;
  }

  const isSelected =
    selectedMemberId === members[0].id || selectedMemberId === members[1].id;

  const handleCoupleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMemberId(members[0].id);
    setIsMemberModalOpen(true);
  };

  const handleMemberClick = (e: React.MouseEvent, memberId: string) => {
    e.stopPropagation();
    setSelectedMemberId(memberId);
    setIsMemberModalOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={handleCoupleClick}
      className={cn(
        'relative flex items-center gap-4 p-3 rounded-xl bg-card border shadow-sm cursor-pointer hover:shadow-md transition-all duration-200',
        isSelected
          ? 'border-foreground ring-2 ring-foreground/20'
          : 'border-border'
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="child-target"
        className="w-3 h-3 bg-foreground border-2 border-background z-30 rounded-full"
      />
      <div className="grid grid-cols-2 gap-3 w-full">
        {members.map((member) => (
          <TreeMemberCard
            key={member.id}
            member={member}
            generationName={generationName}
            isSelected={selectedMemberId === member.id}
            onClick={handleMemberClick}
          />
        ))}
      </div>
      {/* Subtle couple indicator */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-7 h-7 rounded-full bg-muted border-2 border-background shadow-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3.5 h-3.5 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="parent-source"
        className="w-3 h-3 bg-foreground border-2 border-background z-30 rounded-full"
      />
    </motion.div>
  );
}

export const CoupleContainerNode = memo(CoupleContainerNodeComponent);
