// Utility Functions
// TODO: Add more utilities as needed

import { clsx, type ClassValue } from 'clsx';

/**
 * Merge class names conditionally
 * TODO: Consider adding twMerge for Tailwind class deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format a date string
 * TODO: Implement with Intl.DateTimeFormat
 */
export function formatDate(date: string | Date): string {
  // TODO: Implement
  return new Date(date).toLocaleDateString();
}

/**
 * Generate initials from a name
 */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}
