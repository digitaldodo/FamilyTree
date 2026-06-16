"use client";

import { useState } from "react";
import { ExportService, ExportFormat } from "@/services/export.service";
import { Button } from "@/components/ui/button";
import { Download, FileImage, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";

interface ExportToolbarProps {
  elementId: string;
  filename?: string;
}

import { ExportJson } from "./export-json";

export function ExportToolbar({ elementId, treeId, filename = "family-tree" }: ExportToolbarProps & { treeId?: string }) {
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null);
  const { resolvedTheme } = useTheme();

  const handleExport = async (format: ExportFormat) => {
    try {
      setIsExporting(format);
      const bgColor = resolvedTheme === "dark" ? "#09090b" : "#ffffff";
      await ExportService.exportTree(elementId, format, filename, bgColor);
      toast.success(`Tree exported as ${format} successfully!`);
    } catch (error) {
      toast.error(`Failed to export tree as ${format}.`);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-card/80 backdrop-blur-md border border-border p-2 rounded-xl shadow-sm">
      <Button
        variant="ghost"
        size="sm"
        disabled={isExporting !== null}
        onClick={() => handleExport("PNG")}
        className="text-xs font-medium"
      >
        {isExporting === "PNG" ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <FileImage className="w-4 h-4 mr-2 text-primary" />
        )}
        Export PNG
      </Button>
      
      <div className="w-px h-4 bg-border mx-1" />
      
      <Button
        variant="ghost"
        size="sm"
        disabled={isExporting !== null}
        onClick={() => handleExport("PDF")}
        className="text-xs font-medium"
      >
        {isExporting === "PDF" ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <FileText className="w-4 h-4 mr-2 text-primary" />
        )}
        Export PDF
      </Button>

      {treeId && (
        <>
          <div className="w-px h-4 bg-border mx-1" />
          <ExportJson treeId={treeId} filename={filename} />
        </>
      )}
    </div>
  );
}
