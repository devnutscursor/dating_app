/** Copy text — works on iOS Safari where navigator.clipboard often fails. */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to execCommand fallback (common on mobile Safari).
    }
  }

  try {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'fixed';
    el.style.top = '0';
    el.style.left = '0';
    el.style.width = '2em';
    el.style.height = '2em';
    el.style.padding = '0';
    el.style.border = 'none';
    el.style.outline = 'none';
    el.style.boxShadow = 'none';
    el.style.background = 'transparent';
    el.style.opacity = '0';
    el.style.fontSize = '16px'; // Prevents iOS zoom on focus
    document.body.appendChild(el);
    el.focus();
    el.select();
    el.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

export function canNativeShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}
