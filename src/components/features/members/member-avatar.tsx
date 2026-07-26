'use client';

import { useMemo, useState } from 'react';
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

const colorVariants = [
  'bg-indigo-500/10 text-indigo-600',
  'bg-emerald-500/10 text-emerald-600',
  'bg-rose-500/10 text-rose-600',
  'bg-slate-500/10 text-slate-600',
  'bg-violet-500/10 text-violet-600',
];

function hashName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
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
  const [hasLoadError, setHasLoadError] = useState(false);

  const fullName = useMemo(() => {
    return [firstName, lastName].filter(Boolean).join(' ').trim();
  }, [firstName, lastName]);

  const initials = useMemo(() => {
    if (!fullName) return '??';
    const parts = fullName.split(' ');
    return parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }, [fullName]);

  const fallbackClasses = useMemo(() => {
    const idx = hashName(fullName || 'member') % colorVariants.length;
    return colorVariants[idx];
  }, [fullName]);

  const genderColor =
    gender === 'MALE' ? 'text-blue-500' :
    gender === 'FEMALE' ? 'text-pink-500' :
    'text-slate-500';

  if (imageUrl && !hasLoadError) {
    return (
      <div className={cn('absolute inset-0 overflow-hidden', className)}>
        <Image
          src={imageUrl}
          alt={fullName || 'Member'}
          fill
          sizes="100vw"
          onError={() => setHasLoadError(true)}
          className="object-cover absolute inset-0"
        />
      </div>
    );
  }

  return (
    <div className={cn("absolute inset-0 flex items-center justify-center w-full h-full rounded-full text-lg font-semibold tracking-wide", fallbackClasses, className)}>
      {initials || <User2 className={cn(genderColor, iconClassName)} style={{ width: fallbackSize, height: fallbackSize }} />}
    </div>
  );
}
