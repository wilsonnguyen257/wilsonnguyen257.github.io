/**
 * Error handling utilities for consistent error management across the app
 */

/**
 * Extract a user-friendly error message from any error type
 * @param error - The error object (can be Error, string, or unknown)
 * @param fallback - Fallback message if error cannot be extracted
 * @returns A user-friendly error message string
 */
export function getErrorMessage(error: unknown, fallback = 'An unexpected error occurred'): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return fallback;
}

/**
 * Log an error with context for debugging
 * @param context - Description of where/what failed
 * @param error - The error object
 */
export function logError(context: string, error: unknown): void {
  const message = getErrorMessage(error);
  console.error(`[${context}]`, message, error);
}

/**
 * Create a standardized error handler for async operations
 * @param context - Description of the operation
 * @param onError - Callback to handle the error (e.g., show toast)
 * @returns Error handler function
 */
export function createErrorHandler(
  context: string,
  onError?: (message: string) => void
): (error: unknown) => void {
  return (error: unknown) => {
    const message = getErrorMessage(error);
    logError(context, error);
    onError?.(message);
  };
}
