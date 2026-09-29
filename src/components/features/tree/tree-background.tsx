'use client';

import { Background, BackgroundVariant } from '@xyflow/react';
import Image from 'next/image';

export function TreeBackground() {
  return (
    <>
      <Background
        variant={BackgroundVariant.Dots}
        gap={40}
        size={1.2}
        color="currentColor"
        className="text-foreground/[0.06] dark:text-foreground/[0.04]"
      />
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[-1] opacity-[0.03] dark:opacity-[0.05] select-none print:hidden">
        <Image
          src="/logo.png"
          alt="FamilyTree Watermark"
          width={400}
          height={400}
          className="w-[400px] max-w-[80%] h-auto grayscale pointer-events-none"
          unoptimized
        />
      </div>
    </>
  );
}
