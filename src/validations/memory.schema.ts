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
});

export type MemoryFormData = z.infer<typeof memorySchema>;
