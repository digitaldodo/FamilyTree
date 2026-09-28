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
      className="relative flex flex-col w-[190px] h-[250px] transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.02]"
    >
      {/* Target handle for incoming parent connections */}
      <Handle
        type="target"
        position={Position.Top}
        id="child-target"
        className="w-3 h-3 bg-foreground border-background z-30"
      />

      <TreeMemberCard
        member={member}
        generationName={data.generationName}
        isSelected={isSelected}
        onClick={handleClick}
      />

      {/* Source handles for outgoing connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="parent-source"
        className="w-3 h-3 bg-foreground border-background z-30"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="spouse"
        className="w-3 h-3 top-1/2 bg-rose-500 border-background z-30"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="spouse-target"
        className="w-3 h-3 top-1/2 bg-rose-500 border-background z-30"
      />
    </motion.div>
  );
}

export const MemberNode = memo(MemberNodeComponent);
