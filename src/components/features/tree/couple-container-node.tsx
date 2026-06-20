import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { MemberWithRelations } from '@/types/member';
import { MemberNode } from './member-node';

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

  // We map them to member node props shape
  const member1Data = { member: members[0], label: `${members[0].firstName} ${members[0].lastName}`, generationName };
  const member2Data = { member: members[1], label: `${members[1].firstName} ${members[1].lastName}`, generationName };

  return (
    <div className="relative flex flex-row items-center gap-[40px] p-4 rounded-[32px] bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-xl">
      {/* Target handle for incoming parent connections to the couple as a whole */}
      <Handle type="target" position={Position.Top} id="child-target" className="w-4 h-4 bg-purple-500 border-2 border-background" />

      {/* Member 1 */}
      <div className="relative">
        <MemberNode data={member1Data} />
      </div>

      {/* Heart / Wedding ring icon in the middle */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-10 h-10 rounded-full bg-rose-500 shadow-lg border-4 border-background">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>

      {/* Member 2 */}
      <div className="relative">
        <MemberNode data={member2Data} />
      </div>

      {/* Source handle for outgoing connections (children) from the couple as a whole */}
      <Handle type="source" position={Position.Bottom} id="parent-source" className="w-4 h-4 bg-purple-500 border-2 border-background" />
    </div>
  );
}

export const CoupleContainerNode = memo(CoupleContainerNodeComponent);
