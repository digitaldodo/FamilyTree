"use client";

import { Background, BackgroundVariant } from '@xyflow/react';

export function TreeBackground() {
  return (
    <>
      <Background
        variant={BackgroundVariant.Dots}
        gap={24}
        size={1.5}
        color="currentColor"
        className="text-slate-300/70 dark:text-slate-800/70"
      />
    </>
  );
}
