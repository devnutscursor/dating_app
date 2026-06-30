export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return '';
}

/** Server/API messages when the member cannot afford a coin action. */
export function isInsufficientCoinsError(message: string): boolean {
  return /insufficient coins/i.test(message);
}
