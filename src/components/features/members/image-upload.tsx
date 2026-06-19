'use client';
import * as React from 'react';
import { toast } from 'sonner';

import { CldUploadWidget } from 'next-cloudinary';
import { Camera, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  isCover?: boolean;
}

export function ImageUpload({ value, onChange, folder = 'family-tree/avatars', isCover = false }: ImageUploadProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "family-tree";

  const handleUploadSuccess = (result: any) => {
    setIsProcessing(true);
    if (result.info && result.info.secure_url) {
      onChange(result.info.secure_url);
    }
    setIsProcessing(false);
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${isCover ? 'w-full' : ''}`}>
      <div className="relative group w-full flex justify-center">
        {value ? (
          <div className={`relative ${isCover ? 'w-full h-32 md:h-48' : 'w-24 h-24'} rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800`}>
            <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
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

      <CldUploadWidget
        uploadPreset={uploadPreset}
        onSuccess={handleUploadSuccess}
        onError={(error) => {
          // eslint-disable-next-line no-console
          console.log('[API Debug] Cloudinary upload failed', error);
          toast.error('Image upload failed');
          setIsProcessing(false);
        }}
        options={{
          maxFiles: 1,
          resourceType: "image",
          folder: folder,
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
        }}
      >
        {({ open }) => (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isProcessing}
            onClick={(e) => {
              e.preventDefault();
              open();
            }}
          >
            {isProcessing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
            ) : (
              <><Camera className="w-4 h-4 mr-2" /> {value ? 'Change Image' : 'Upload Image'}</>
            )}
          </Button>
        )}
      </CldUploadWidget>
    </div>
  );
}

