import { getTreeById } from './tree.service';

/**
 * Service to handle exporting family tree data as JSON for backup.
 */
export const BackupService = {
  /**
   * Fetches the tree by ID, serializes the data, and triggers a download.
   */
  async exportTreeJson(treeId: string, filename?: string): Promise<void> {
    try {
      const response = await getTreeById(treeId);
      const treeData = response.data;
      
      if (!treeData) {
        throw new Error('No tree data found');
      }

      // Create a blob from the JSON data
      const jsonString = JSON.stringify(treeData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename || treeData.name || 'family-tree'}-backup.json`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export tree JSON:', error);
      throw error;
    }
  }
};
