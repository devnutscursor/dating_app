/** Avoids stray commas when city/country are missing from the API. */
export function formatProfileLocation(city?: string | null, country?: string | null): string {
  const c = (city ?? '').trim();
  const co = (country ?? '').trim();
  if (c && co) return `${c}, ${co.toUpperCase()}`;
  if (c) return c;
  if (co) return co.length <= 3 ? co.toUpperCase() : co;
  return '';
}
