export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return '';
}

/** Server/API messages when the member cannot afford a coin action. */
export function isInsufficientCoinsError(message: string): boolean {
  const m = message.trim().toLowerCase();
  if (!m) return false;
  return (
    /insufficient coins/i.test(m) ||
    /need at least \d+ coins/i.test(m) ||
    /not enough coins/i.test(m) ||
    /cannot afford/i.test(m)
  );
}
