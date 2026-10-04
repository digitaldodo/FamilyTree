/**
 * FamilyTree — PDF Export & Print
 *
 * Strategy:
 *  1. Temporarily inject a white, chrome-free print surface (hide UI panels,
 *     force white background, clear dark generation lane fills).
 *  2. Measure the tight bounding box around the actual member nodes.
 *  3. Ask `pdf-layout` for the page (orientation + ISO size) and the centered,
 *     aspect-preserving fit for that REAL page — the one and only geometry
 *     shared by the PDF and by browser print.
 *  4. Capture the tree as JPEG at a resolution matched to its size on the page.
 *  5. Compose the document in jsPDF (or a print-only DOM for window.print())
 *     and verify the produced page really has the requested orientation.
 *  6. Restore all original styles before resolving.
 *
 * Target: < 5 MB for a typical family tree with member photos.
 */

import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { getNodesBounds, type Node } from '@xyflow/react';
import {
  computePixelRatio,
  computeTreeLayout,
  type OrientationPreference,
  type TreeLayout,
} from '@/lib/pdf-layout';

// ─── constants ──────────────────────────────────────────────────────────────

const JPEG_QUALITY = 0.75; // 0–1; preserves card text while reducing size
const CAPTURE_PADDING_PX = 20;

// CSS selectors for application chrome to hide during capture
const HIDE_SELECTORS = [
  '.react-flow__panel',
  '.react-flow__controls',
  '.react-flow__minimap',
  '[data-sidebar]',
  '.tree-toolbar',
  '[data-toolbar]',
  '[data-radix-popper-content-wrapper]',
  '[role="dialog"]',
  // FamilyTree watermark overlay (the visual canvas watermark)
  '.tree-watermark',
  '.react-flow__handle',
];

export interface TreeExportOptions {
  /** Defaults to Landscape. 'auto' picks from the tree's own proportions. */
  orientation?: OrientationPreference;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function hideElements(): { el: HTMLElement; display: string }[] {
  const hidden: { el: HTMLElement; display: string }[] = [];
  for (const sel of HIDE_SELECTORS) {
    document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
      hidden.push({ el, display: el.style.display });
      el.style.display = 'none';
    });
  }
  return hidden;
}

function restoreElements(hidden: { el: HTMLElement; display: string }[]) {
  for (const { el, display } of hidden) {
    el.style.display = display;
  }
}

function loadImageDataUrl(url: string): Promise<string | null> {
  return fetch(url)
    .then((response) => (response.ok ? response.blob() : null))
    .then(
      (blob) =>
        new Promise<string | null>((resolve) => {
          if (!blob) return resolve(null);
          const reader = new FileReader();
          reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        })
    )
    .catch(() => null);
}

/** Force a white background on the viewport so dark themes don't bleed. */
function patchViewportBackground(viewport: HTMLElement): () => void {
  const orig = viewport.style.background;
  const origBg = viewport.style.backgroundColor;
  viewport.style.background = '#ffffff';
  viewport.style.backgroundColor = '#ffffff';

  // Add global exporting class
  document.body.classList.add('exporting-pdf');

  // Also clear generation lane backgrounds (they use dark ink fill)
  const lanes = viewport.querySelectorAll<HTMLElement>('.react-flow__node-generationLane');
  const laneOriginals: { el: HTMLElement; bg: string }[] = [];
  lanes.forEach((lane) => {
    laneOriginals.push({ el: lane, bg: lane.style.background });
    lane.style.background = 'transparent';
  });

  return () => {
    viewport.style.background = orig;
    viewport.style.backgroundColor = origBg;
    document.body.classList.remove('exporting-pdf');
    laneOriginals.forEach(({ el, bg }) => {
      el.style.background = bg;
    });
  };
}

interface TreeCapture {
  dataUrl: string;
  layout: TreeLayout;
}

/**
 * Captures the tree as a JPEG and computes the page layout for it.
 * Handles hiding app chrome and always restores the DOM.
 */
async function captureTree(
  nodes: Node[] | undefined,
  options: TreeExportOptions,
  papers?: readonly ('A4' | 'A3' | 'A2' | 'A1')[]
): Promise<TreeCapture> {
  const viewport = document.querySelector<HTMLElement>('.react-flow__viewport');
  if (!viewport) throw new Error('Family tree canvas not found.');
  if (!nodes || nodes.length === 0) throw new Error('No family members to export.');

  const hidden = hideElements();
  const restoreBackground = patchViewportBackground(viewport);

  try {
    // Tight bounding box around member nodes (generation lanes excluded).
    const captureNodes = nodes.filter((n) => n.type !== 'generationLane');
    const bounds = getNodesBounds(captureNodes);
    const captureW = Math.ceil(bounds.width + CAPTURE_PADDING_PX * 2);
    const captureH = Math.ceil(bounds.height + CAPTURE_PADDING_PX * 2);

    const layout = computeTreeLayout({
      treeWidthPx: captureW,
      treeHeightPx: captureH,
      orientation: options.orientation,
      papers,
    });
    const pixelRatio = computePixelRatio(layout, captureW, captureH);

    const dataUrl = await toJpeg(viewport, {
      backgroundColor: '#ffffff',
      quality: JPEG_QUALITY,
      pixelRatio,
      width: captureW,
      height: captureH,
      style: {
        width: `${captureW}px`,
        height: `${captureH}px`,
        transform: `translate(${-bounds.x + CAPTURE_PADDING_PX}px, ${-bounds.y + CAPTURE_PADDING_PX}px) scale(1)`,
        transformOrigin: '0 0',
        background: '#ffffff',
      },
      // Filter out remaining UI chrome that may have survived
      filter: (node) => {
        const el = node as HTMLElement;
        if (!el.classList) return true;
        if (el.classList.contains('react-flow__panel')) return false;
        if (el.classList.contains('react-flow__controls')) return false;
        if (el.classList.contains('react-flow__minimap')) return false;
        if (el.classList.contains('react-flow__background')) return false;
        if (el.classList.contains('tree-watermark')) return false;
        return true;
      },
    });

    return { dataUrl, layout };
  } finally {
    restoreBackground();
    restoreElements(hidden);
  }
}

function getFullTitle(treeName: string) {
  return treeName.toLowerCase().includes('family tree') ? treeName : `${treeName} Family Tree`;
}

function toSafeFileName(treeName: string) {
  return treeName.replace(/[^a-z0-9_\- ]/gi, '_').slice(0, 60);
}

// ─── PDF ─────────────────────────────────────────────────────────────────────

export async function exportTreeToPDF(
  treeName: string = 'family-tree',
  nodes?: Node[],
  options: TreeExportOptions = {}
): Promise<void> {
  const [{ dataUrl, layout }, logoDataUrl] = await Promise.all([
    captureTree(nodes, options),
    loadImageDataUrl('/logo.png'),
  ]);
  const { page, metrics, area, image } = layout;
  const { unit, margin, header, footer } = metrics;

  // Create the document on the exact page computed by the layout module.
  const pdf = new jsPDF({
    orientation: page.orientation,
    unit: 'mm',
    format: [page.width, page.height],
    compress: true,
  });

  // Guard: the real PDF page must match the orientation that was requested.
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const isLandscapePage = pageW > pageH;
  if (isLandscapePage !== (page.orientation === 'landscape')) {
    throw new Error(
      `PDF orientation mismatch: expected ${page.orientation}, got ${pageW.toFixed(0)}×${pageH.toFixed(0)}mm.`
    );
  }

  pdf.setProperties({
    title: `${treeName} - Family Tree`,
    author: 'FamilyTree',
    subject: 'Family history and genealogy',
    creator: 'FamilyTree App',
  });

  // White page background
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, pageW, pageH, 'F');

  // Header: family name
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16 * unit);
  pdf.setTextColor(30, 30, 30);
  const fullTitle = getFullTitle(treeName);
  const titleLimit = Math.floor(56 * (pageW / 297));
  const titleText =
    fullTitle.length > titleLimit ? `${fullTitle.slice(0, titleLimit - 1)}.` : fullTitle;
  const headerBaseline = header * 0.62;
  pdf.text(titleText, margin, headerBaseline);

  // Header: generated date
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9 * unit);
  pdf.setTextColor(100, 100, 100);
  const generatedText = `Generated on ${new Date().toLocaleDateString('en-GB')}`;
  pdf.text(generatedText, pageW - margin - pdf.getTextWidth(generatedText), headerBaseline);

  // Separator under header
  pdf.setDrawColor(230, 230, 230);
  pdf.setLineWidth(0.3 * unit);
  pdf.line(margin, header, pageW - margin, header);

  // Footer line + small branding
  const footerY = pageH - footer;
  pdf.line(margin, footerY, pageW - margin, footerY);
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(8 * unit);
  pdf.setTextColor(150, 150, 150);
  pdf.text('FamilyTree', margin, footerY + footer * 0.65);

  // Subtle logo watermark behind the tree area
  const watermarkCx = area.x + area.w / 2;
  const watermarkCy = area.y + area.h / 2;
  pdf.saveGraphicsState();
  pdf.setGState(pdf.GState({ opacity: 0.03 }));
  if (logoDataUrl) {
    const watermarkSize = Math.min(72 * unit, area.h * 0.38, area.w * 0.25);
    pdf.addImage(
      logoDataUrl,
      'PNG',
      watermarkCx - watermarkSize / 2,
      watermarkCy - watermarkSize / 2,
      watermarkSize,
      watermarkSize,
      undefined,
      'FAST'
    );
  } else {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(48 * unit);
    pdf.setTextColor(18, 61, 45);
    pdf.text('FamilyTree', watermarkCx - pdf.getTextWidth('FamilyTree') / 2, watermarkCy);
  }
  pdf.restoreGraphicsState();

  // The tree: fitted and centered by the shared layout.
  pdf.addImage(dataUrl, 'JPEG', image.x, image.y, image.w, image.h, undefined, 'FAST');

  pdf.save(`${toSafeFileName(treeName)}-family-tree.pdf`);
}

// ─── Browser print ───────────────────────────────────────────────────────────

const PRINT_ROOT_ID = 'tree-print-root';
const PRINT_STYLE_ID = 'tree-print-style';

/**
 * Prints the tree using the SAME capture + layout as the PDF, but on a physical
 * A4 sheet. A dedicated print-only surface is mounted and the entire app UI is
 * hidden via @media print, and `@page` is set to the chosen orientation.
 */
export async function printTree(
  treeName: string = 'family-tree',
  nodes?: Node[],
  options: TreeExportOptions = {}
): Promise<void> {
  const { dataUrl, layout } = await captureTree(nodes, options, ['A4']);
  const { page, metrics, image } = layout;

  cleanupPrintSurface();

  const style = document.createElement('style');
  style.id = PRINT_STYLE_ID;
  style.textContent = `
    #${PRINT_ROOT_ID} { display: none; }
    @page { size: A4 ${page.orientation}; margin: 0; }
    @media print {
      html, body { margin: 0 !important; padding: 0 !important; background: #fff !important;
        height: auto !important; overflow: visible !important; }
      body > *:not(#${PRINT_ROOT_ID}) { display: none !important; }
      #${PRINT_ROOT_ID} { display: block !important; position: relative; overflow: hidden;
        width: ${page.width}mm; height: ${page.height - 1}mm; background: #fff;
        break-inside: avoid; page-break-after: avoid; }
      #${PRINT_ROOT_ID} * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  `;

  const root = document.createElement('div');
  root.id = PRINT_ROOT_ID;

  const title = document.createElement('div');
  title.textContent = getFullTitle(treeName);
  title.style.cssText = `position:absolute;left:${metrics.margin}mm;top:${metrics.header * 0.25}mm;
    font:700 ${16 * metrics.unit}pt Helvetica,Arial,sans-serif;color:#1e1e1e;`;

  const date = document.createElement('div');
  date.textContent = `Generated on ${new Date().toLocaleDateString('en-GB')}`;
  date.style.cssText = `position:absolute;right:${metrics.margin}mm;top:${metrics.header * 0.35}mm;
    font:400 ${9 * metrics.unit}pt Helvetica,Arial,sans-serif;color:#646464;`;

  const img = document.createElement('img');
  img.alt = `${treeName} family tree`;
  img.src = dataUrl;
  img.style.cssText = `position:absolute;left:${image.x}mm;top:${image.y}mm;width:${image.w}mm;height:${image.h}mm;`;

  root.append(title, date, img);
  document.head.appendChild(style);
  document.body.appendChild(root);

  try {
    await img.decode();
  } catch {
    // decode() can reject for data URLs in some engines; printing still works.
  }

  const cleanup = () => {
    window.removeEventListener('afterprint', cleanup);
    cleanupPrintSurface();
  };
  window.addEventListener('afterprint', cleanup);
  window.print();
}

function cleanupPrintSurface() {
  document.getElementById(PRINT_ROOT_ID)?.remove();
  document.getElementById(PRINT_STYLE_ID)?.remove();
}
