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

export async function exportElementAsPDF(elementId: string, filename: string = 'family-tree.pdf', backgroundColor: string = '#ffffff') {
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element with id ${elementId} not found`);

  await new Promise(resolve => setTimeout(resolve, 500));

  const dataUrl = await toPng(element, { 
    quality: 1, 
    backgroundColor,
    pixelRatio: 2
  });

  // Calculate PDF dimensions based on image aspect ratio
  const imgProps = new Image();
  imgProps.src = dataUrl;
  
  await new Promise((resolve) => {
    imgProps.onload = resolve;
  });

  const pdf = new jsPDF({
    orientation: imgProps.width > imgProps.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [imgProps.width, imgProps.height]
  });

  pdf.addImage(dataUrl, 'PNG', 0, 0, imgProps.width, imgProps.height);
  pdf.save(filename);
}
