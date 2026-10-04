/**
 * FamilyTree — export page geometry
 *
 * Single source of truth for page orientation, paper size and tree fitting.
 * Both the jsPDF exporter and the browser-print path consume the SAME layout so
 * "Landscape" in the UI, the PDF page box and the printed sheet always agree.
 *
 * This module is intentionally pure (no DOM / no jsPDF) so it can be unit tested.
 */

export type Orientation = 'landscape' | 'portrait';
export type OrientationPreference = Orientation | 'auto';

/** Landscape is the default for a brand-new export. */
export const DEFAULT_ORIENTATION_PREFERENCE: OrientationPreference = 'landscape';

/** ISO 216 A-series, short/long edge in millimetres. All share a 1:√2 ratio. */
export const PAPER_SIZES = [
  { name: 'A4', short: 210, long: 297 },
  { name: 'A3', short: 297, long: 420 },
  { name: 'A2', short: 420, long: 594 },
  { name: 'A1', short: 594, long: 841 },
] as const;

export type PaperName = (typeof PAPER_SIZES)[number]['name'];

/** CSS px → mm (96 dpi). */
export const MM_PER_PX = 25.4 / 96;

/**
 * Smallest physical scale (mm of paper per tree CSS px) that keeps member
 * names legible (~6pt). If A4 would need to shrink the tree below this, the
 * exporter steps up to the next ISO size (same aspect ratio, still landscape).
 */
export const MIN_READABLE_MM_PER_PX = 0.15;

export interface PageSize {
  paper: PaperName;
  width: number;
  height: number;
  orientation: Orientation;
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DocumentMetrics {
  /** Scale factor relative to A4 (short edge 210mm). */
  unit: number;
  margin: number;
  header: number;
  footer: number;
  gap: number;
}

export interface TreeLayout {
  page: PageSize;
  metrics: DocumentMetrics;
  /** Area reserved for the tree (inside margins, below header, above footer). */
  area: Box;
  /** Where the tree image is drawn — centered inside `area`, aspect preserved. */
  image: Box;
  /** Millimetres of paper per tree CSS pixel. */
  mmPerPx: number;
}

export function resolveOrientation(
  preference: OrientationPreference | undefined,
  treeWidthPx: number,
  treeHeightPx: number
): Orientation {
  const pref = preference ?? DEFAULT_ORIENTATION_PREFERENCE;
  if (pref === 'landscape' || pref === 'portrait') return pref;
  return treeWidthPx >= treeHeightPx ? 'landscape' : 'portrait';
}

export function getPageSize(paper: PaperName, orientation: Orientation): PageSize {
  const spec = PAPER_SIZES.find((p) => p.name === paper) ?? PAPER_SIZES[0];
  return orientation === 'landscape'
    ? { paper: spec.name, width: spec.long, height: spec.short, orientation }
    : { paper: spec.name, width: spec.short, height: spec.long, orientation };
}

export function getDocumentMetrics(page: PageSize): DocumentMetrics {
  const unit = Math.min(page.width, page.height) / 210;
  return {
    unit,
    margin: 12 * unit,
    header: 16 * unit,
    footer: 8 * unit,
    gap: 4 * unit,
  };
}

function fitOnPage(page: PageSize, treeW: number, treeH: number): TreeLayout {
  const metrics = getDocumentMetrics(page);
  const area: Box = {
    x: metrics.margin,
    y: metrics.header + metrics.gap,
    w: page.width - metrics.margin * 2,
    h: page.height - metrics.header - metrics.gap - metrics.footer - metrics.gap,
  };

  // Uniform scale that makes the *whole* tree fit in the printable area.
  const mmPerPx = Math.min(area.w / treeW, area.h / treeH);
  const w = treeW * mmPerPx;
  const h = treeH * mmPerPx;

  return {
    page,
    metrics,
    area,
    image: { x: area.x + (area.w - w) / 2, y: area.y + (area.h - h) / 2, w, h },
    mmPerPx,
  };
}

export interface ComputeTreeLayoutInput {
  treeWidthPx: number;
  treeHeightPx: number;
  orientation?: OrientationPreference;
  /** Restrict which ISO sizes may be used (e.g. ['A4'] for physical printing). */
  papers?: readonly PaperName[];
}

/**
 * Pick orientation, then the smallest paper on which the full tree is still
 * readable, then fit + center the tree using the ACTUAL page dimensions.
 * No constants are tied to a specific family — this works for any tree shape.
 */
export function computeTreeLayout(input: ComputeTreeLayoutInput): TreeLayout {
  const { treeWidthPx, treeHeightPx } = input;
  if (!(treeWidthPx > 0) || !(treeHeightPx > 0) || !Number.isFinite(treeWidthPx + treeHeightPx)) {
    throw new Error('Cannot lay out a tree with empty bounds.');
  }

  const orientation = resolveOrientation(input.orientation, treeWidthPx, treeHeightPx);
  const allowed = PAPER_SIZES.filter((p) => !input.papers || input.papers.includes(p.name));
  const candidates = allowed.length ? allowed : PAPER_SIZES.slice(0, 1);

  let layout = fitOnPage(getPageSize(candidates[0].name, orientation), treeWidthPx, treeHeightPx);
  for (const paper of candidates) {
    layout = fitOnPage(getPageSize(paper.name, orientation), treeWidthPx, treeHeightPx);
    if (layout.mmPerPx >= MIN_READABLE_MM_PER_PX) break;
  }
  return layout;
}

/**
 * Raster scale used when capturing the tree so the image has ~`dpi` pixels per
 * inch at the size it is placed on the page — bounded so mobile browsers don't
 * exceed canvas limits and file sizes stay reasonable.
 */
export function computePixelRatio(
  layout: TreeLayout,
  treeWidthPx: number,
  treeHeightPx: number,
  { dpi = 170, min = 1, max = 3, maxPixels = 16_000_000 } = {}
): number {
  const targetPx = (layout.image.w / 25.4) * dpi;
  let ratio = Math.min(max, Math.max(min, targetPx / treeWidthPx));
  const pixels = treeWidthPx * treeHeightPx * ratio * ratio;
  if (pixels > maxPixels) ratio = Math.sqrt(maxPixels / (treeWidthPx * treeHeightPx));
  return ratio;
}
