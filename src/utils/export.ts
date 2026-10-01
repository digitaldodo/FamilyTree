import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export async function exportElementAsPNG(elementId: string, filename: string = 'family-tree.png', backgroundColor: string = '#ffffff') {
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element with id ${elementId} not found`);

  // Wait a small amount for any fonts/images to render properly
  await new Promise(resolve => setTimeout(resolve, 500));

  const dataUrl = await toPng(element, {
    quality: 1,
    backgroundColor,
    pixelRatio: 2 // High resolution
  });

  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export async function exportElementAsPDF(elementId: string, filename: string = 'family-tree.pdf', _backgroundColor: string = '#ffffff') {
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element with id ${elementId} not found`);

  // Apply PDF-specific overrides so cards render clean & light regardless of dark-mode
  const root = document.documentElement;
  root.classList.add('pdf-export-mode');

  // Allow styles to propagate and fonts/images to settle
  await new Promise(resolve => setTimeout(resolve, 600));

  let dataUrl: string;
  try {
    dataUrl = await toPng(element, {
      quality: 0.92,
      // Force a warm-ivory background matching the FamilyTree brand
      backgroundColor: '#F7F2E7',
      pixelRatio: 2,
      // Skip elements that shouldn't appear in the PDF
      filter: (node: Element) => {
        if (!(node instanceof Element)) return true;
        // Exclude interactive UI chrome: controls, minimap, toolbar, handles
        const skipClasses = [
          'react-flow__controls',
          'react-flow__minimap',
          'react-flow__panel',
          'react-flow__handle',
          'export-toolbar',
          'print-hidden',
        ];
        return !skipClasses.some(cls => node.classList?.contains(cls));
      },
    });
  } finally {
    // Always restore the original theme class, even if capture fails
    root.classList.remove('pdf-export-mode');
  }

  // Calculate PDF dimensions based on image aspect ratio
  const img = new Image();
  img.src = dataUrl;

  await new Promise<void>((resolve) => {
    img.onload = () => resolve();
  });

  // Use landscape orientation for wide trees; add 12mm margin on each side
  const MARGIN_MM = 12;
  const aspectRatio = img.naturalWidth / img.naturalHeight;
  const isLandscape = aspectRatio > 1;

  // A3 landscape fits most trees; fall back to exact pixel dimensions if larger
  const A3_W_MM = isLandscape ? 420 : 297;
  const A3_H_MM = isLandscape ? 297 : 420;

  const pdfW = Math.max(A3_W_MM, img.naturalWidth / 3.78); // 1mm ≈ 3.78px at 96dpi
  const pdfH = pdfW / aspectRatio;

  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [Math.min(pdfW, A3_W_MM * 3), Math.min(pdfH, A3_H_MM * 3)], // guard huge trees
  });

  const usableW = pdf.internal.pageSize.getWidth() - MARGIN_MM * 2;
  const usableH = pdf.internal.pageSize.getHeight() - MARGIN_MM * 2;

  // Scale image to fit within usable area, preserving aspect ratio
  let drawW = usableW;
  let drawH = drawW / aspectRatio;
  if (drawH > usableH) {
    drawH = usableH;
    drawW = drawH * aspectRatio;
  }

  const offsetX = MARGIN_MM + (usableW - drawW) / 2;
  const offsetY = MARGIN_MM + (usableH - drawH) / 2;

  pdf.addImage(dataUrl, 'PNG', offsetX, offsetY, drawW, drawH, undefined, 'FAST');
  pdf.save(filename);
}
