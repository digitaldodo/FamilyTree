'use client';

import { useEffect, useMemo, useState } from 'react';
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
  fallbackSize = 24,
}: MemberAvatarProps) {
  const [hasLoadError, setHasLoadError] = useState(false);

  // A member can receive a new image while this component remains mounted.
  // Resetting the failure state lets the replacement image render instead of
  // leaving a previously failed avatar stuck on its initials fallback.
  useEffect(() => {
    setHasLoadError(false);
  }, [imageUrl]);

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
    gender === 'MALE'
      ? 'text-blue-500'
      : gender === 'FEMALE'
        ? 'text-pink-500'
        : 'text-slate-500';

  if (imageUrl && !hasLoadError) {
    return (
      <div className={cn('relative overflow-hidden rounded-full shrink-0', className)}>
        <Image
          src={imageUrl}
          alt={fullName || 'Member'}
          fill
          sizes="(max-width: 768px) 40px, 48px"
          unoptimized
          onError={() => setHasLoadError(true)}
          className="object-cover absolute inset-0"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full text-lg font-semibold tracking-wide shrink-0',
        fallbackClasses,
        className
      )}
    >
      {initials || (
        <User2
          className={cn(genderColor, iconClassName)}
          style={{ width: fallbackSize, height: fallbackSize }}
        />
      )}
    </div>
  );
}
