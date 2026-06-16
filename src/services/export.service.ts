import { exportElementAsPNG, exportElementAsPDF } from "@/utils/export";

export type ExportFormat = 'PNG' | 'PDF';

export class ExportService {
  /**
   * Export a specific element to the desired format
   * @param elementId The ID of the DOM element to export (e.g. the React Flow wrapper)
   * @param format 'PNG' or 'PDF'
   * @param filename Base filename without extension
   * @param backgroundColor Background color for the export (hex)
   */
  static async exportTree(
    elementId: string, 
    format: ExportFormat, 
    filename: string = 'family-tree',
    backgroundColor: string = '#ffffff'
  ): Promise<void> {
    try {
      if (format === 'PNG') {
        await exportElementAsPNG(elementId, `${filename}.png`, backgroundColor);
      } else if (format === 'PDF') {
        await exportElementAsPDF(elementId, `${filename}.pdf`, backgroundColor);
      }
    } catch (error) {
      console.error(`Export to ${format} failed:`, error);
      throw error;
    }
  }
}
