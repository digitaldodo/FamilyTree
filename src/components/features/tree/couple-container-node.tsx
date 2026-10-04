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
      className="relative flex items-center gap-6"
    >
      <Handle
        type="target"
        position={Position.Top}
        id="child-target"
        className="opacity-0 pointer-events-none w-0 h-0"
      />
      
      {members.map((member, index) => (
        <div key={member.id} className="relative w-[190px] h-[250px]">
          <TreeMemberCard
            member={member}
            generationName={index === 0 ? generationName : undefined} // Only show generation on first partner to avoid clutter
            isSelected={selectedMemberId === member.id}
            onClick={handleMemberClick}
          />
          {/* Gold Flow Card Perimeter Animation for EACH individual person */}
          <svg className="absolute inset-0 pointer-events-none z-30" viewBox="0 0 190 250">
            <rect
              id={`glow-rect-${member.id}`}
              x="1"
              y="1"
              width="188"
              height="248"
              rx="11"
              fill="none"
              stroke="var(--color-tree-gold, #d4af37)"
              strokeWidth="2"
              className="gold-flow-card-perimeter opacity-0 transition-opacity"
              style={{ strokeDasharray: '864', strokeDashoffset: '864' }}
            />
          </svg>
        </div>
      ))}
      
      {/* Subtle spouse relationship connector line */}
      <div className="absolute top-1/2 left-[190px] right-[190px] h-[2px] bg-[var(--color-tree-spouse)] -translate-y-1/2 z-0 opacity-80" />

      {/* Subtle couple indicator */}
      <div 
        onClick={handleCoupleClick}
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-card border-2 cursor-pointer transition-all shadow-sm",
          isSelected ? "border-[var(--color-tree-spouse)] text-[var(--color-tree-spouse)] scale-110" : "border-background text-muted-foreground hover:border-[var(--color-tree-spouse)] hover:text-[var(--color-tree-spouse)]"
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
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
        className="opacity-0 pointer-events-none w-0 h-0"
      />
    </motion.div>
  );
}

export const CoupleContainerNode = memo(CoupleContainerNodeComponent);
