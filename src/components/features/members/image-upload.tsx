'use client';
import * as React from 'react';
import { toast } from 'sonner';

import { Camera, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ImageCropper } from '@/components/ui/image-cropper';

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  isCover?: boolean;
}

export function ImageUpload({ value, onChange, folder = 'family-tree/avatars', isCover = false }: ImageUploadProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = React.useState<string | null>(null);
  
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "family-tree";
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setSelectedImageSrc(reader.result?.toString() || null);
      });
      reader.readAsDataURL(file);
      // Reset input
      e.target.value = '';
    }
  };

  const uploadToCloudinary = async (blob: Blob) => {
    if (!cloudName) {
      toast.error('Cloudinary configuration is missing.');
      return;
    }
    
    setIsProcessing(true);
    setSelectedImageSrc(null); // Close modal

    try {
      const formData = new FormData();
      formData.append('file', blob);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', folder);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      let data;
    try {
      try {
        data = await res.json();
      } catch (e) {
        throw new Error("Invalid JSON response from server");
      }
    } catch (e) {
      throw new Error("Invalid JSON response from server");
    }
      
      if (data.secure_url) {
        onChange(data.secure_url);
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      console.error('[API Debug] Cloudinary upload failed', err);
      toast.error('Image upload failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${isCover ? 'w-full' : ''}`}>
      <div className="relative group w-full flex justify-center">
        {value ? (
          <div className={`relative ${isCover ? 'w-full h-32 md:h-48' : 'w-24 h-24'} rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800`}>
            <Image src={value} alt="Uploaded" fill className="w-full h-full object-cover" unoptimized />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onChange(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className={`${isCover ? 'w-full h-32 md:h-48 rounded-xl' : 'w-24 h-24 rounded-full'} border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-slate-900`}>
            <Camera className="w-8 h-8 text-slate-400" />
          </div>
        )}
      </div>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={isProcessing}
        onClick={(e) => {
          e.preventDefault();
          fileInputRef.current?.click();
        }}
      >
        {isProcessing ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
        ) : (
          <><Camera className="w-4 h-4 mr-2" /> {value ? 'Change Image' : 'Upload Image'}</>
        )}
      </Button>

      {selectedImageSrc && (
        <ImageCropper
          isOpen={!!selectedImageSrc}
          onClose={() => setSelectedImageSrc(null)}
          imageSrc={selectedImageSrc}
          onCropComplete={uploadToCloudinary}
          cropShape={isCover ? 'rect' : 'round'}
          aspectRatio={isCover ? 16 / 9 : 1}
        />
      )}
    </div>
  );
}

