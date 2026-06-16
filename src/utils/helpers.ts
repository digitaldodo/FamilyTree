// Helper Functions
// TODO: Add more helpers as needed

/**
 * Delay execution (useful for loading state demos)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Truncate text to a max length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Generate a full name from first and last
 */
export function fullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

// TODO: Add date formatting helpers
// TODO: Add URL building helpers
// TODO: Add error message extraction helper
