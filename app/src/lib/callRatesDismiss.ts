const STORAGE_PREFIX = 'memberdate:call-rates-dismissed:';

export function isCallRatesWarningDismissed(userId: string): boolean {
  if (!userId) return false;
  try {
    return localStorage.getItem(`${STORAGE_PREFIX}${userId}`) === '1';
  } catch {
    return false;
  }
}

export function persistCallRatesWarningDismissed(userId: string): void {
  if (!userId) return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${userId}`, '1');
  } catch {
    /* ignore quota / private mode */
  }
}
