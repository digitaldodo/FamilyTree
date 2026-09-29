'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { memorySchema, MemoryFormData } from '@/validations/memory.schema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MultiImageUpload } from './multi-image-upload';
import { SelectMembers } from '../members/select-members';
import { IconPicker } from '@/components/ui/icon-picker';
import { ImageUpload } from '../members/image-upload';
import { useMembers } from '@/hooks/use-members';
import { useAppStore } from '@/store/use-app-store';
import { Label } from '@/components/ui/label';

interface MemoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MemoryFormData) => Promise<void>;
  initialData?: any;
  isSubmitting?: boolean;
}

export function MemoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
}: MemoryFormModalProps) {
  const activeTreeId = useAppStore((s) => s.activeTreeId);
  const { members = [] } = useMembers(activeTreeId || undefined);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(memorySchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      date: initialData?.date
        ? new Date(initialData.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      type: 'MEMORY',
      googlePhotosAlbumUrl: initialData?.googlePhotosAlbumUrl || '',
      location: initialData?.location || '',
      tags: initialData?.tags || [],
      memberIds: initialData?.members?.map((m: any) => m.memberId) || [],
      mediaUrls: initialData?.media?.map((m: any) => m.url) || [],
      icon: initialData?.icon || 'star',
      iconColor: initialData?.iconColor || 'blue',
      albumCoverUrl: initialData?.albumCoverUrl || '',
      albumTitle: initialData?.albumTitle || '',
      photoCount: initialData?.photoCount || null,
    },
  });

  // Reset form when opened with new initialData
  React.useEffect(() => {
    if (isOpen) {
      reset({
        title: initialData?.title || '',
        description: initialData?.description || '',
        date: initialData?.date
          ? new Date(initialData.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        type: 'MEMORY',
        googlePhotosAlbumUrl: initialData?.googlePhotosAlbumUrl || '',
        location: initialData?.location || '',
        tags: initialData?.tags || [],
        memberIds: initialData?.members?.map((m: any) => m.memberId) || [],
        mediaUrls: initialData?.media?.map((m: any) => m.url) || [],
        icon: initialData?.icon || 'star',
        iconColor: initialData?.iconColor || 'blue',
        albumCoverUrl: initialData?.albumCoverUrl || '',
        albumTitle: initialData?.albumTitle || '',
        photoCount: initialData?.photoCount || null,
      });
    }
  }, [isOpen, initialData, reset]);

  const onFormSubmit = async (data: any) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Memory' : 'Add Memory'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Family Trip to Agra"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-destructive">
                {String(errors.title.message)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="date" {...register('date')} />
              {errors.date && (
                <p className="text-sm text-destructive">
                  {String(errors.date.message)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Memory Icon</Label>
              <Controller
                control={control}
                name="icon"
                render={({ field: iconField }) => (
                  <Controller
                    control={control}
                    name="iconColor"
                    render={({ field: colorField }) => (
                      <IconPicker
                        iconId={iconField.value}
                        colorId={colorField.value}
                        onIconChange={iconField.onChange}
                        onColorChange={colorField.onChange}
                      />
                    )}
                  />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Agra, India"
                {...register('location')}
              />
              {errors.location && (
                <p className="text-sm text-destructive">
                  {String(errors.location.message)}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Story / Description</Label>
            <Textarea
              id="description"
              placeholder="Share the story behind this memory..."
              className="min-h-[100px]"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {String(errors.description.message)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>People Involved</Label>
            <Controller
              control={control}
              name="memberIds"
              render={({ field }) => (
                <SelectMembers
                  members={members}
                  selectedIds={field.value || []}
                  onChange={field.onChange}
                />
              )}
            />
            <p className="text-xs text-muted-foreground">
              Select family members present in this memory.
            </p>
            {errors.memberIds && (
              <p className="text-sm text-destructive">
                {String(errors.memberIds.message)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Photos</Label>
            <Controller
              control={control}
              name="mediaUrls"
              render={({ field }) => (
                <MultiImageUpload
                  urls={field.value || []}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.mediaUrls && (
              <p className="text-sm text-destructive">
                {String(errors.mediaUrls.message)}
              </p>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <h4 className="font-medium text-sm">External Album Integration</h4>
            
            <div className="space-y-2">
              <Label htmlFor="googlePhotosAlbumUrl">
                Album Link
              </Label>
              <Input
                id="googlePhotosAlbumUrl"
                type="url"
                placeholder="https://photos.app.goo.gl/..."
                {...register('googlePhotosAlbumUrl')}
              />
              <p className="text-xs text-muted-foreground">
                Link to an external Google Photos album.
              </p>
              {errors.googlePhotosAlbumUrl && (
                <p className="text-sm text-destructive">
                  {String(errors.googlePhotosAlbumUrl.message)}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="albumTitle">Album Title</Label>
                  <Input
                    id="albumTitle"
                    placeholder="e.g., Summer Vacation 2026"
                    {...register('albumTitle')}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="photoCount">Photo Count</Label>
                  <Input
                    id="photoCount"
                    type="number"
                    placeholder="e.g., 42"
                    {...register('photoCount', { valueAsNumber: true })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Album Cover</Label>
                <Controller
                  control={control}
                  name="albumCoverUrl"
                  render={({ field }) => (
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      folder="family-tree/albums"
                      isCover={true}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Memory'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
