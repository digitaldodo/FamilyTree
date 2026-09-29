import { z } from 'zod';

export const memorySchema = z.object({
  title: z.string().min(1, 'Title is required').max(150, 'Title is too long'),
  description: z.string().max(2000, 'Description is too long').optional().nullable(),
  date: z.string().or(z.date()).transform(val => new Date(val)),
  type: z.string().default('MEMORY'),
  googlePhotosAlbumUrl: z
    .string()
    .url('Must be a valid URL')
    .refine((url) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === 'https:';
      } catch {
        return false;
      }
    }, 'URL must use HTTPS')
    .optional()
    .nullable(),
  location: z.string().max(200, 'Location is too long').optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  memberIds: z.array(z.string()).optional().default([]),
  mediaUrls: z.array(z.string()).optional().default([]),
  icon: z.string().optional().nullable(),
  iconColor: z.string().optional().nullable(),
  albumCoverUrl: z.string().optional().nullable(),
  albumTitle: z.string().optional().nullable(),
  photoCount: z.number().int().optional().nullable(),
});

export type MemoryFormData = z.infer<typeof memorySchema>;
