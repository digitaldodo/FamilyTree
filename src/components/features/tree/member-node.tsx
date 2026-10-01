'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Handle, Position } from '@xyflow/react';
import { MemberWithRelations } from '@/types/member';
import { useAppStore } from '@/store/use-app-store';
import { TreeMemberCard } from './tree-member-card';

interface MemberNodeProps {
  data: {
    member: MemberWithRelations;
    label: string;
    generationName?: string;
  };
}

function MemberNodeComponent({ data }: MemberNodeProps) {
  const { member } = data;
  const selectedMemberId = useAppStore((s) => s.selectedMemberId);
  const setSelectedMemberId = useAppStore((s) => s.setSelectedMemberId);
  const setIsMemberModalOpen = useAppStore((s) => s.setIsMemberModalOpen);

  const isSelected = selectedMemberId === member.id;

  const handleClick = (e: React.MouseEvent, memberId: string) => {
    setSelectedMemberId(memberId);
    setIsMemberModalOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="relative flex flex-col w-[190px] h-[250px]"
    >
      {/* Target handle for incoming parent connections */}
      <Handle
        type="target"
        position={Position.Top}
        id="child-target"
        className="opacity-0 pointer-events-none w-0 h-0"
      />

      <TreeMemberCard
        member={member}
        generationName={data.generationName}
        isSelected={isSelected}
        onClick={handleClick}
      />

      {/* Gold Flow Card Perimeter Animation */}
      <svg className="absolute inset-0 pointer-events-none z-30" viewBox="0 0 190 250">
        <rect
          x="1"
          y="1"
          width="188"
          height="248"
          rx="11"
          fill="none"
          stroke="var(--color-tree-gold, #d4af37)"
          strokeWidth="2"
          className="gold-flow-card-animation"
          style={{ opacity: 0.8 }}
        />
      </svg>

      {/* Source handles for outgoing connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="parent-source"
        className="opacity-0 pointer-events-none w-0 h-0"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="spouse"
        className="opacity-0 pointer-events-none w-0 h-0"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="spouse-target"
        className="opacity-0 pointer-events-none w-0 h-0"
      />
    </motion.div>
  );
}

export const MemberNode = memo(MemberNodeComponent);
