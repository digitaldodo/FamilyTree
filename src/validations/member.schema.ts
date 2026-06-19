// Member Validation Schemas
// Zod-based runtime validation for member CRUD operations

import { z } from 'zod';

/** Gender enum values */
const genderEnum = z.enum(['MALE', 'FEMALE', 'OTHER']);

/** Relationship type enum values */
const relationshipTypeEnum = z.enum(['PARENT', 'SPOUSE', 'SIBLING']);

/**
 * Coerce empty strings to undefined so optional validators work correctly.
 * This prevents empty form fields from failing .url() or .email() checks.
 */
const emptyToUndefined = z.literal('').transform(() => undefined);

/** Optional URL: accepts a valid URL, empty string (→ undefined), or undefined */
const optionalUrl = z.string().url('Must be a valid URL').optional().or(emptyToUndefined);

/** Optional email: accepts a valid email, empty string (→ undefined), or undefined */
const optionalEmail = z.string().email('Invalid email address').optional().or(emptyToUndefined);

/** Optional trimmed string: accepts a non-empty string, empty string (→ undefined), or undefined */
const optionalString = (maxLen: number) =>
  z.string().max(maxLen).trim().optional().or(emptyToUndefined);

/**
 * Date string schema — accepts DD-MM-YYYY or ISO 8601 format.
 * Transforms to ISO string for consistent storage.
 *
 * Supports both formats because:
 * - DD-MM-YYYY comes from form inputs
 * - ISO strings can come from client-side pre-processing
 */
const dateStringSchema = z.string().trim().transform((val) => {
  if (!val) return undefined;

  // Already an ISO date string (e.g., from form-level Zod transform)
  if (/^\d{4}-\d{2}-\d{2}/.test(val)) {
    const d = new Date(val);
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString();
  }

  // DD-MM-YYYY format from form input
  if (/^\d{2}-\d{2}-\d{4}$/.test(val)) {
    const [d, m, y] = val.split('-');
    const date = new Date(`${y}-${m}-${d}T00:00:00.000Z`);
    if (isNaN(date.getTime())) return undefined;
    return date.toISOString();
  }

  return undefined;
});

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
  middleName: optionalString(100),
  birthDate: dateStringSchema.optional().or(emptyToUndefined),
  deathDate: dateStringSchema.optional().or(emptyToUndefined),
  gender: genderEnum.optional(),
  bio: optionalString(2000),
  imageUrl: optionalUrl,
  coverImage: optionalUrl,
  phone: optionalString(20),
  email: optionalEmail,
  address: optionalString(500),
  occupation: optionalString(200),
  generationId: z.string().trim().min(1, 'Generation is required'),
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
  middleName: optionalString(100).nullable(),
  birthDate: dateStringSchema.optional().nullable().or(emptyToUndefined),
  deathDate: dateStringSchema.optional().nullable().or(emptyToUndefined),
  gender: genderEnum.optional().nullable(),
  bio: optionalString(2000).nullable(),
  imageUrl: optionalUrl.nullable(),
  coverImage: optionalUrl.nullable(),
  phone: optionalString(20).nullable(),
  email: optionalEmail.nullable(),
  address: optionalString(500).nullable(),
  occupation: optionalString(200).nullable(),
  generationId: z.string().optional(),
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
