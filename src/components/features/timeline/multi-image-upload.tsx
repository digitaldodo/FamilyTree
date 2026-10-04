'use client';
import * as React from 'react';
import { toast } from 'sonner';
import { Camera, X, Loader2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { GooglePhotosPicker } from '../members/google-photos-picker';

interface MultiImageUploadProps {
  urls: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
}

export function MultiImageUpload({
  urls,
  onChange,
  folder = 'family-tree/memories',
}: MultiImageUploadProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);

  const uploadPreset =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'family-tree';
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const uploadToCloudinary = async (file: File) => {
    if (!cloudName) {
      toast.error('Cloudinary configuration is missing.');
      return null;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', folder);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('Server returned invalid response');
      }

      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to upload image');
      }

      return data.secure_url;
    } catch (error: any) {
      toast.error(error.message || 'Error uploading image');
      return null;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setIsProcessing(true);

    const newUrls: string[] = [];
    const files = Array.from(e.target.files);

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        continue;
      }

      const url = await uploadToCloudinary(file);
      if (url) {
        newUrls.push(url);
      }
    }

    if (newUrls.length > 0) {
      onChange([...urls, ...newUrls]);
    }

    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGooglePhoto = async (blob: Blob) => {
    setIsProcessing(true);
    const file = new File([blob], `google-photo-${Date.now()}.jpg`, {
      type: blob.type || 'image/jpeg',
    });
    
    const url = await uploadToCloudinary(file);
    if (url) {
      onChange([...urls, url]);
    }
    setIsProcessing(false);
  };

  const removeImage = (indexToRemove: number) => {
    onChange(urls.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {urls.map((url, index) => (
          <div
            key={index}
            className="relative group w-24 h-24 rounded-md overflow-hidden border border-border"
          >
            <Image
              src={url}
              alt={`Memory image ${index + 1}`}
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        <button
          type="button"
          disabled={isProcessing}
          onClick={() => fileInputRef.current?.click()}
          className="w-24 h-24 flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border hover:border-foreground/50 hover:bg-muted transition-colors text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Camera className="w-4 h-4" />
              <span className="text-xs">Add Photo</span>
            </>
          )}
        </button>

      </div>
      <div className="w-full sm:w-auto">
        <GooglePhotosPicker onPhotoSelected={handleGooglePhoto} disabled={isProcessing} />
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        multiple
      />
    </div>
  );
}
