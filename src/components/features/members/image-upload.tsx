'use client';

import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import { convertFileToBase64 } from '@/services/upload.service';
import { Avatar } from '@/components/ui/avatar';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  value?: string | null;
  onChange: (base64String: string | null) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setIsProcessing(true);
      try {
        const base64 = await convertFileToBase64(acceptedFiles[0]);
        onChange(base64);
      } catch (err) {
        console.error('Failed to parse image', err);
      } finally {
        setIsProcessing(false);
      }
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <Avatar src={value} size="xl" className="border-2 border-dashed border-primary" />
        
        {value && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onChange(null)}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div
        {...getRootProps()}
        className={`w-full p-4 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <Camera className="h-6 w-6" />
          {isProcessing ? (
            <p>Processing...</p>
          ) : isDragActive ? (
            <p>Drop the image here...</p>
          ) : (
            <p>Drag & drop an image, or click to select</p>
          )}
        </div>
      </div>
    </div>
  );
}
