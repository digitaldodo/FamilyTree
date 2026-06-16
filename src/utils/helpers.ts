// Helper Functions
// Reusable utilities for the application

import { AVATAR_PLACEHOLDER } from './constants';

/** Delay execution (useful for loading state demos) */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Truncate text to a max length with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '\u2026';
}

/** Generate a full name from parts */
export function fullName(
  firstName: string,
  lastName: string,
  middleName?: string | null,
): string {
  const parts = [firstName, middleName, lastName].filter(Boolean);
  return parts.join(' ').trim();
}

/** Generate an avatar URL from a name using DiceBear */
export function generateAvatarUrl(
  firstName: string,
  lastName: string,
): string {
  const seed = encodeURIComponent(`${firstName} ${lastName}`);
  return `${AVATAR_PLACEHOLDER}?seed=${seed}`;
}

/** Calculate age from birth date (and optional death date) */
export function calculateAge(
  birthDate: string | Date,
  deathDate?: string | Date | null,
): number | null {
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return null;
  const end = deathDate ? new Date(deathDate) : new Date();
  let age = end.getFullYear() - birth.getFullYear();
  const monthDiff = end.getMonth() - birth.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && end.getDate() < birth.getDate())
  ) {
    age--;
  }
  return age;
}

/** Determine if a member is alive based on death date */
export function isAlive(deathDate?: string | Date | null): boolean {
  return !deathDate;
}

/** Extract a human-readable error message from an unknown error */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
}

/** Format a generation level to a descriptive label */
export function generationLabel(generation: number): string {
  const labels: Record<number, string> = {
    0: 'Grandparents',
    1: 'Parents',
    2: 'Current Generation',
    3: 'Children',
    4: 'Grandchildren',
  };
  return labels[generation] ?? `Generation ${generation}`;
}

/** Slugify a string for URL-safe usage */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
