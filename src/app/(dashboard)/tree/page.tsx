import { FamilyTree } from '@/components/features/tree/family-tree';
import { MemberModal } from '@/components/features/members/member-modal';

export default function TreePage() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <FamilyTree />
      <MemberModal />
    </div>
  );
}
