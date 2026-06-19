import { User2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Gender } from '@/types/member';

interface MemberAvatarProps {
  imageUrl?: string | null;
  firstName?: string;
  lastName?: string;
  gender?: Gender | null;
  className?: string;
  iconClassName?: string;
  fallbackSize?: number;
}

export function MemberAvatar({
  imageUrl,
  firstName,
  lastName,
  gender,
  className,
  iconClassName,
  fallbackSize = 24
}: MemberAvatarProps) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={firstName && lastName ? `${firstName} ${lastName}` : 'Member'}
        className={cn("w-full h-full object-cover absolute inset-0", className)}
      />
    );
  }

  const genderColor = 
    gender === 'MALE' ? 'text-blue-400' :
    gender === 'FEMALE' ? 'text-pink-400' :
    'text-slate-400';

  const genderBg =
    gender === 'MALE' ? 'bg-blue-500/10' :
    gender === 'FEMALE' ? 'bg-pink-500/10' :
    'bg-slate-500/10';

  return (
    <div className={cn("absolute inset-0 flex items-center justify-center w-full h-full", genderBg, className)}>
      <User2 className={cn(genderColor, iconClassName)} style={{ width: fallbackSize, height: fallbackSize }} />
    </div>
  );
}
