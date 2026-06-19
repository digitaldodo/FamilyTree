'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Modal } from './modal';
import { Button } from './button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { getCroppedImg } from '@/utils/cropImage';

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
  cropShape?: 'rect' | 'round';
  aspectRatio?: number;
}

export function ImageCropper({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
  cropShape = 'rect',
  aspectRatio = 1,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const handleCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleSave = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImage) {
        onCropComplete(croppedImage);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crop Image" className="max-w-md">
      <div className="relative w-full h-64 md:h-80 bg-black/5 rounded-lg overflow-hidden mt-2">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          cropShape={cropShape}
          onCropChange={setCrop}
          onCropComplete={handleCropComplete}
          onZoomChange={setZoom}
          showGrid={false}
        />
      </div>
      
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <ZoomOut className="w-5 h-5 text-muted-foreground" />
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <ZoomIn className="w-5 h-5 text-muted-foreground" />
        </div>
        
        <div className="flex justify-between items-center pt-2">
          <Button variant="outline" size="sm" onClick={handleReset} type="button">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
            <Button onClick={handleSave} type="button">Save</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
