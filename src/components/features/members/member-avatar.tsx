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

export function MemberAvatar({
  imageUrl,
  firstName,
  lastName,
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
    if (!fullName) return '';
    const parts = fullName.split(' ');
    return parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }, [fullName]);

  if (imageUrl && !hasLoadError) {
    return (
      <div className={cn('relative overflow-hidden rounded-full shrink-0 w-full h-full bg-secondary', className)}>
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
        'relative flex items-center justify-center rounded-full text-lg font-semibold tracking-wide shrink-0 w-full h-full bg-secondary text-secondary-foreground border border-primary/10',
        className
      )}
    >
      {initials ? initials : (
        <User2
          className={cn("text-muted-foreground", iconClassName)}
          style={{ width: fallbackSize, height: fallbackSize }}
        />
      )}
    </div>
  );
}
