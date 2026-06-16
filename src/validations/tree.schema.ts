// Tree Validation Schemas
// Zod-based runtime validation for tree CRUD operations

import { z } from 'zod';

/** Schema for creating a new tree */
export const createTreeSchema = z.object({
  name: z
    .string()
    .min(1, 'Tree name is required')
    .max(200, 'Tree name must be at most 200 characters')
    .trim(),
  description: z
    .string()
    .max(2000, 'Description must be at most 2000 characters')
    .trim()
    .optional(),
  isPublic: z.boolean().optional().default(false),
  ownerId: z.string().min(1, 'Owner ID is required'),
});

/** Schema for updating a tree (all fields optional) */
export const updateTreeSchema = z.object({
  name: z
    .string()
    .min(1, 'Tree name cannot be empty')
    .max(200, 'Tree name must be at most 200 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .max(2000, 'Description must be at most 2000 characters')
    .trim()
    .optional()
    .nullable(),
  isPublic: z.boolean().optional(),
});

/** Inferred types from schemas */
export type CreateTreeSchemaType = z.infer<typeof createTreeSchema>;
export type UpdateTreeSchemaType = z.infer<typeof updateTreeSchema>;
