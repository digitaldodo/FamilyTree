/**
 * Adaptive photo layout for greeting cards.
 *
 * Instead of dropping N photos into one fixed arrangement, the cluster size is
 * computed from how many photos there are and how much room the card format
 * gives them — so one portrait stays bold, and a whole family still gets
 * faces that are large enough to recognise.
 */

import type { CanvasFormat } from '@/types/greetings';

export type ClusterStyle = 'portraits' | 'album';

export interface ClusterLayout {
  cols: number;
  rows: number;
  /** Tile edge / circle diameter in card px. */
  size: number;
  gap: number;
  width: number;
  height: number;
}

export const CANVAS_DIMENSIONS: Record<CanvasFormat, { width: number; height: number }> = {
  PORTRAIT: { width: 1080, height: 1350 },
  SQUARE: { width: 1080, height: 1080 },
  LANDSCAPE: { width: 1200, height: 675 },
};

/**
 * One member's photos → editorial "album" tiles.
 * Several people (or an uploaded set) → circular family portraits.
 */
export function chooseClusterStyle(photos: { memberId?: string }[]): ClusterStyle {
  if (photos.length < 2) return 'portraits';
  const owners = new Set(photos.map((p) => p.memberId ?? '__unassigned__'));
  return owners.size === 1 ? 'album' : 'portraits';
}

/** Largest equal-size grid that fits `count` items inside maxW × maxH. */
export function layoutCluster(
  count: number,
  maxW: number,
  maxH: number,
  { maxSize = 240, gap = 16 }: { maxSize?: number; gap?: number } = {}
): ClusterLayout {
  if (count <= 0) return { cols: 0, rows: 0, size: 0, gap, width: 0, height: 0 };

  let best: ClusterLayout | null = null;
  for (let cols = 1; cols <= count; cols++) {
    const rows = Math.ceil(count / cols);
    const size = Math.floor(
      Math.min((maxW - gap * (cols - 1)) / cols, (maxH - gap * (rows - 1)) / rows, maxSize)
    );
    if (size <= 0) continue;
    // Prefer the biggest tiles; on a near-tie prefer fewer rows (shorter band).
    if (!best || size > best.size + 1 || (Math.abs(size - best.size) <= 1 && rows < best.rows)) {
      best = {
        cols,
        rows,
        size,
        gap,
        width: cols * size + gap * (cols - 1),
        height: rows * size + gap * (rows - 1),
      };
    }
  }

  // Extremely large counts: fall back to a minimum legible grid rather than nothing.
  return (
    best ?? {
      cols: count,
      rows: 1,
      size: 40,
      gap: 8,
      width: count * 48,
      height: 40,
    }
  );
}

/**
 * How much of the card the supporting-photo band may use, per format.
 * `compact` is for foreground-hero layouts where the hero shares the card.
 */
export function getClusterBudget(format: CanvasFormat, compact = false) {
  const { width, height } = CANVAS_DIMENSIONS[format];
  const factor = compact ? 0.72 : 1;
  switch (format) {
    case 'LANDSCAPE':
      return { maxW: width - 240, maxH: Math.round(height * 0.34 * factor), maxSize: Math.round(150 * factor) };
    case 'SQUARE':
      return { maxW: width - 200, maxH: Math.round(height * 0.34 * factor), maxSize: Math.round(220 * factor) };
    case 'PORTRAIT':
    default:
      return { maxW: width - 200, maxH: Math.round(height * 0.36 * factor), maxSize: Math.round(260 * factor) };
  }
}