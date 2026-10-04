import * as React from 'react';
import { Palette } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FrameSelector } from '@/components/features/members/frame-selector';
import { MemberWithRelations } from '@/types/member';
import { useMemberMutations } from '@/hooks/use-member-mutations';

export function FrameQuickAction({ member }: { member: MemberWithRelations }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [styleValue, setStyleValue] = React.useState(member.frameStyle || 'default');
  const [colorValue, setColorValue] = React.useState(member.frameColor || '');
  const { updateMember, isSubmitting } = useMemberMutations(member.treeId);

  const handleSave = async () => {
    try {
      await updateMember(member.id, {
        frameStyle: styleValue,
        frameColor: colorValue,
      });
      setIsOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2 left-2 z-40 bg-background/80 hover:bg-background text-foreground/70 hover:text-foreground p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity border border-border shadow-sm backdrop-blur-sm"
          title="Customize Frame"
        >
          <Palette className="w-3.5 h-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Customize {member.firstName}'s Frame</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <FrameSelector
            styleValue={styleValue}
            onStyleChange={setStyleValue}
            colorValue={colorValue}
            onColorChange={setColorValue}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
