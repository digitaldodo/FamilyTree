'use client';

import { Background, BackgroundVariant } from '@xyflow/react';

export function TreeBackground() {
  return (
    <Background
      variant={BackgroundVariant.Dots}
      gap={48}
      size={1.5}
      color="currentColor"
      className="text-border/40 dark:text-border/20"
    />
  );
}
