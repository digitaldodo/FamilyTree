import { z } from 'zod';

export const createGenerationSchema = z.object({
  name: z.string().min(1, 'Generation name is required').max(100, 'Name must be at most 100 characters').trim(),
  insertAt: z.number().int().optional(),
});

export const updateGenerationSchema = z.object({
  name: z.string().min(1, 'Generation name cannot be empty').max(100, 'Name must be at most 100 characters').trim(),
});

export type CreateGenerationSchemaType = z.infer<typeof createGenerationSchema>;
export type UpdateGenerationSchemaType = z.infer<typeof updateGenerationSchema>;
