// Member Validation Schemas
// Zod-based runtime validation for member CRUD operations

import { z } from 'zod';

/** Gender enum values */
const genderEnum = z.enum(['MALE', 'FEMALE', 'OTHER']);

/** Relationship type enum values */
const relationshipTypeEnum = z.enum(['PARENT', 'SPOUSE', 'SIBLING']);

/** Schema for creating a new member */
export const createMemberSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must be at most 100 characters')
    .trim(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be at most 100 characters')
    .trim(),
  middleName: z
    .string()
    .max(100, 'Middle name must be at most 100 characters')
    .trim()
    .optional(),
  birthDate: z
    .string()
    .datetime({ message: 'Birth date must be a valid ISO date' })
    .optional(),
  deathDate: z
    .string()
    .datetime({ message: 'Death date must be a valid ISO date' })
    .optional(),
  gender: genderEnum.optional(),
  bio: z
    .string()
    .max(2000, 'Bio must be at most 2000 characters')
    .trim()
    .optional(),
  avatar: z.string().url('Avatar must be a valid URL').optional(),
  coverImage: z.string().url('Cover Image must be a valid URL').optional(),
  phone: z
    .string()
    .max(20, 'Phone must be at most 20 characters')
    .trim()
    .optional(),
  email: z.string().email('Invalid email address').optional(),
  address: z
    .string()
    .max(500, 'Address must be at most 500 characters')
    .trim()
    .optional(),
  occupation: z
    .string()
    .max(200, 'Occupation must be at most 200 characters')
    .trim()
    .optional(),
  generation: z.number().int().min(0).max(20).optional(),
  treeId: z.string().min(1, 'Tree ID is required'),
});

/** Schema for updating a member (all fields optional, nullable where appropriate) */
export const updateMemberSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name cannot be empty')
    .max(100, 'First name must be at most 100 characters')
    .trim()
    .optional(),
  lastName: z
    .string()
    .min(1, 'Last name cannot be empty')
    .max(100, 'Last name must be at most 100 characters')
    .trim()
    .optional(),
  middleName: z
    .string()
    .max(100, 'Middle name must be at most 100 characters')
    .trim()
    .optional()
    .nullable(),
  birthDate: z
    .string()
    .datetime({ message: 'Birth date must be a valid ISO date' })
    .optional()
    .nullable(),
  deathDate: z
    .string()
    .datetime({ message: 'Death date must be a valid ISO date' })
    .optional()
    .nullable(),
  gender: genderEnum.optional().nullable(),
  bio: z
    .string()
    .max(2000, 'Bio must be at most 2000 characters')
    .trim()
    .optional()
    .nullable(),
  avatar: z.string().url('Avatar must be a valid URL').optional().nullable(),
  coverImage: z.string().url('Cover Image must be a valid URL').optional().nullable(),
  phone: z
    .string()
    .max(20, 'Phone must be at most 20 characters')
    .trim()
    .optional()
    .nullable(),
  email: z.string().email('Invalid email address').optional().nullable(),
  address: z
    .string()
    .max(500, 'Address must be at most 500 characters')
    .trim()
    .optional()
    .nullable(),
  occupation: z
    .string()
    .max(200, 'Occupation must be at most 200 characters')
    .trim()
    .optional()
    .nullable(),
  generation: z.number().int().min(0).max(20).optional(),
});

/** Schema for creating a relationship between members */
export const createRelationshipSchema = z.object({
  type: relationshipTypeEnum,
  fromId: z.string().min(1, 'Source member ID is required'),
  toId: z.string().min(1, 'Target member ID is required'),
});

/** Inferred types from schemas */
export type CreateMemberSchemaType = z.infer<typeof createMemberSchema>;
export type UpdateMemberSchemaType = z.infer<typeof updateMemberSchema>;
export type CreateRelationshipSchemaType = z.infer<
  typeof createRelationshipSchema
>;
