/**
 * FamilyTree — PDF Export
 *
 * Strategy:
 *  1. Temporarily inject a white, chrome-free print surface (hide UI panels,
 *     force white background, clear dark generation lane fills).
 *  2. Capture only the tight bounding box around the actual member nodes using
 *     html-to-image's JPEG encoder at a print-friendly 1.5× pixel ratio.
 *  3. Compose the final document in jsPDF on the best-fitting A3 orientation,
 *     with a restrained header, footer, and FamilyTree logo watermark.
 *  4. Restore all original styles before resolving.
 *
 * Target: < 5 MB for a typical family tree with member photos.
 */

import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { getNodesBounds, type Node } from '@xyflow/react';

// ─── constants ──────────────────────────────────────────────────────────────

const DOC_PADDING_MM = 12;          // page margin in mm
const HEADER_HEIGHT_MM = 18;        // top header band
const FOOTER_HEIGHT_MM = 8;         // bottom footer band
const PIXEL_RATIO = 1.5;            // lower = smaller file; 1.5 is a sweet spot
const JPEG_QUALITY = 0.75;          // 0–1; preserves card text while reducing size

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
];

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
    laneOriginals.forEach(({ el, bg }) => { el.style.background = bg; });
  };
}


// ─── main export ─────────────────────────────────────────────────────────────

export async function exportTreeToPDF(
  treeName: string = 'family-tree',
  nodes?: Node[]
): Promise<void> {
  // 1. Locate the ReactFlow viewport
  const viewport = document.querySelector<HTMLElement>('.react-flow__viewport');
  if (!viewport) throw new Error('Family tree canvas not found.');

  if (!nodes || nodes.length === 0) {
    throw new Error('No family members to export.');
  }

  // 2. Hide chrome / UI panels
  const hidden = hideElements();

  // 3. Patch backgrounds
  const restoreBackground = patchViewportBackground(viewport);

  try {
    // 4. Calculate tight bounding box around all nodes
    // Exclude generation lanes from bounds calculation for a tighter crop
    const memberNodes = nodes.filter(n => n.type !== 'generationLane');
    const bounds = getNodesBounds(memberNodes);
    const PADDING_PX = 80;
    const captureW = Math.ceil(bounds.width + PADDING_PX * 2);
    const captureH = Math.ceil(bounds.height + PADDING_PX * 2);

    // Auto-detect orientation based on tree dimensions
    const isLandscape = captureW >= captureH;
    const orientation = isLandscape ? 'landscape' : 'portrait';
    const pageFormat = isLandscape ? [420, 297] : [297, 420]; // A3

    // 5. Capture the viewport as JPEG with tight crop
    const [dataUrl, logoDataUrl] = await Promise.all([
      toJpeg(viewport, {
      backgroundColor: '#ffffff',
      quality: JPEG_QUALITY,
      pixelRatio: PIXEL_RATIO,
      width: captureW,
      height: captureH,
      style: {
        width: `${captureW}px`,
        height: `${captureH}px`,
        transform: `translate(${-bounds.x + PADDING_PX}px, ${-bounds.y + PADDING_PX}px) scale(1)`,
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
        return true;
      },
      }),
      loadImageDataUrl('/logo.png'),
    ]);

    // 6. Compose the PDF document
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: pageFormat,
      compress: true,
    });

    pdf.setProperties({
      title: `${treeName} — Family Tree`,
      author: 'FamilyTree',
      subject: 'Family history and genealogy',
      creator: 'FamilyTree App',
    });

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    // 6a. White page background
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageW, pageH, 'F');

    // 6c. Top Header: Family Name
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.setTextColor(30, 30, 30);
    const fullTitle = treeName.toLowerCase().includes('family tree')
      ? treeName
      : `${treeName} Family Tree`;
    const titleLimit = isLandscape ? 56 : 38;
    const titleText =
      fullTitle.length > titleLimit
        ? `${fullTitle.slice(0, titleLimit - 1)}…`
        : fullTitle;
    pdf.text(titleText, DOC_PADDING_MM, HEADER_HEIGHT_MM / 2 + 4);

    // 6d. Top Header: Generated Date
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    const dateStr = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY
    const generatedText = `Generated on ${dateStr}`;
    const dateW = pdf.getTextWidth(generatedText);
    pdf.text(generatedText, pageW - DOC_PADDING_MM - dateW, HEADER_HEIGHT_MM / 2 + 4);

    // 6e. Separator line below header
    pdf.setDrawColor(230, 230, 230);
    pdf.setLineWidth(0.3);
    pdf.line(DOC_PADDING_MM, HEADER_HEIGHT_MM, pageW - DOC_PADDING_MM, HEADER_HEIGHT_MM);

    // 6f. Footer line + small branding
    const footerY = pageH - FOOTER_HEIGHT_MM;
    pdf.line(DOC_PADDING_MM, footerY, pageW - DOC_PADDING_MM, footerY);
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    const ftLabel = 'FamilyTree';
    pdf.text(ftLabel, DOC_PADDING_MM, pageH - FOOTER_HEIGHT_MM / 2 + 1.5);

    // 6g. Subtle FamilyTree logo watermark behind the tree area
    const treeAreaTop = HEADER_HEIGHT_MM + DOC_PADDING_MM;
    const treeAreaH = footerY - treeAreaTop - DOC_PADDING_MM;
    const watermarkCx = pageW / 2;
    const watermarkCy = treeAreaTop + treeAreaH / 2;
    pdf.saveGraphicsState();
    pdf.setGState(pdf.GState({ opacity: 0.03 }));
    if (logoDataUrl) {
      const watermarkSize = Math.min(72, treeAreaH * 0.38, pageW * 0.25);
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
      pdf.setFontSize(48);
      pdf.setTextColor(18, 61, 45);
      const watermarkText = 'FamilyTree';
      pdf.text(
        watermarkText,
        watermarkCx - pdf.getTextWidth(watermarkText) / 2,
        watermarkCy
      );
    }
    pdf.restoreGraphicsState();

    // 6h. Place the tree image, scaled to fill the content area
    const contentW = pageW - DOC_PADDING_MM * 2;
    const contentH = treeAreaH;
    const imgAspect = captureW / captureH;
    const contentAspect = contentW / contentH;

    let imgW: number, imgH: number;
    if (imgAspect > contentAspect) {
      imgW = contentW;
      imgH = contentW / imgAspect;
    } else {
      imgH = contentH;
      imgW = contentH * imgAspect;
    }

    const imgX = DOC_PADDING_MM + (contentW - imgW) / 2;
    const imgY = treeAreaTop + (contentH - imgH) / 2;

    pdf.addImage(dataUrl, 'JPEG', imgX, imgY, imgW, imgH, undefined, 'FAST');

    // 7. Save
    const safeName = treeName.replace(/[^a-z0-9_\- ]/gi, '_').slice(0, 60);
    pdf.save(`${safeName}-family-tree.pdf`);

  } finally {
    // 8. Always restore the DOM, even if an error occurred
    restoreBackground();
    restoreElements(hidden);
  }
}
