"use client";

import { useState } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ImagePlus, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface UploadMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (url: string, publicId: string, caption?: string, eventTag?: string) => Promise<void>;
}

export function UploadMemoryModal({ isOpen, onClose, onUpload }: UploadMemoryModalProps) {
  const [caption, setCaption] = useState('');
  const [eventTag, setEventTag] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUploadSuccess = async (result: any) => {
    setIsProcessing(true);
    try {
      if (result.info) {
        await onUpload(
          result.info.secure_url,
          result.info.public_id,
          caption,
          eventTag
        );
      }
      onClose();
      setCaption('');
      setEventTag('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center text-slate-800 dark:text-white">
            Add Memory
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Caption
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write something about this memory..."
                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 transition-shadow resize-none"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Event Tag
              </label>
              <input
                type="text"
                value={eventTag}
                onChange={(e) => setEventTag(e.target.value)}
                placeholder="e.g. Summer Vacation 2023"
                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 transition-shadow"
              />
            </div>
          </div>

          <CldUploadWidget
            signatureEndpoint="/api/upload"
            onSuccess={handleUploadSuccess}
            options={{
              maxFiles: 1,
              resourceType: "image",
              clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "gif"],
              styles: {
                palette: {
                  window: "#FFFFFF",
                  windowBorder: "#90A0B3",
                  tabIcon: "#0078FF",
                  menuIcons: "#5A616A",
                  textDark: "#000000",
                  textLight: "#FFFFFF",
                  link: "#0078FF",
                  action: "#FF620C",
                  inactiveTabIcon: "#0E2F5A",
                  error: "#F44235",
                  inProgress: "#0078FF",
                  complete: "#20B832",
                  sourceBg: "#E4EBF1"
                }
              }
            }}
          >
            {({ open }) => {
              return (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    open();
                  }}
                  disabled={isProcessing}
                  className="w-full group relative flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed border-indigo-200 dark:border-indigo-900 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all"
                >
                  {isProcessing ? (
                    <div className="flex flex-col items-center gap-2 text-indigo-600 dark:text-indigo-400">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <span className="font-medium text-sm">Processing...</span>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                        <ImagePlus className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="text-center">
                        <span className="font-medium text-indigo-600 dark:text-indigo-400">
                          Click to upload image
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Supported formats: JPG, PNG, WEBP, GIF
                        </p>
                      </div>
                    </>
                  )}
                </button>
              );
            }}
          </CldUploadWidget>
        </div>
      </DialogContent>
    </Dialog>
  );
}
