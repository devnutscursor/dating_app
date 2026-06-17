import { countries, normalizeCountryValue } from '@/config/design';

const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;

export type ResolvedSearchQuery =
  | { type: 'userId'; value: string }
  | { type: 'country'; value: string };

/** Interpret header / filter ID field: MongoDB user id or country name/code. */
export function resolveSearchQuery(raw: string): ResolvedSearchQuery | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (OBJECT_ID_RE.test(trimmed)) {
    return { type: 'userId', value: trimmed };
  }

  const countryCode = normalizeCountryValue(trimmed);
  if (countryCode) {
    return { type: 'country', value: countryCode };
  }

  const lower = trimmed.toLowerCase();
  const labelMatches = countries.filter((c) => c.label.toLowerCase().includes(lower));
  if (labelMatches.length === 1) {
    return { type: 'country', value: labelMatches[0].value };
  }

  return null;
}
