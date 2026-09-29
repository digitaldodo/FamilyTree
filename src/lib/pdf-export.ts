import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { getNodesBounds, type Node } from '@xyflow/react';

export async function exportTreeToPDF(treeName: string = 'family-tree', nodes?: Node[]) {
  const flowElement = document.querySelector('.react-flow__viewport') as HTMLElement;
  if (!flowElement) {
    throw new Error('Family tree not found in the DOM.');
  }

  const container = document.querySelector('.react-flow') as HTMLElement;

  if (!container) {
    throw new Error('Family tree container not found.');
  }
  
  if (nodes && nodes.length > 0) {
    // Calculate bounds of all nodes
    const bounds = getNodesBounds(nodes);
    
    // Width and height of the bounding box, adding padding
    const padding = 100;
    const width = bounds.width + padding * 2;
    const height = bounds.height + padding * 2;

    // We capture the viewport directly, transforming it temporarily via html-to-image style injection
    const dataUrl = await toPng(flowElement, {
      backgroundColor: '#ffffff',
      width: width,
      height: height,
      style: {
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate(${-bounds.x + padding}px, ${-bounds.y + padding}px) scale(1)`,
      },
      pixelRatio: 2,
    });

    const pdf = new jsPDF({
      orientation: width > height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [width, height],
    });

    pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
    pdf.save(`${treeName}.pdf`);
    return;
  }

  // Fallback to container capture
  const dataUrl = await toPng(container, {
    backgroundColor: '#ffffff',
    quality: 1,
    pixelRatio: 2,
    filter: (node) => {
      // Exclude toolbars and non-tree elements
      if (node?.classList?.contains('react-flow__panel')) return false;
      if (node?.classList?.contains('react-flow__controls')) return false;
      return true;
    }
  });

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  
  const imgProps = pdf.getImageProperties(dataUrl);
  const imgRatio = imgProps.width / imgProps.height;
  const pdfRatio = pdfWidth / pdfHeight;

  let finalWidth, finalHeight;
  if (imgRatio > pdfRatio) {
    finalWidth = pdfWidth;
    finalHeight = pdfWidth / imgRatio;
  } else {
    finalHeight = pdfHeight;
    finalWidth = pdfHeight * imgRatio;
  }

  const marginX = (pdfWidth - finalWidth) / 2;
  const marginY = (pdfHeight - finalHeight) / 2;

  pdf.addImage(dataUrl, 'PNG', marginX, marginY, finalWidth, finalHeight);
  pdf.save(`${treeName}.pdf`);
}
