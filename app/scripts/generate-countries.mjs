import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DISPLAY_NAME_OVERRIDES = {
  BO: 'Bolivia',
  CD: 'Democratic Republic of the Congo',
  CG: 'Republic of the Congo',
  CI: "Côte d'Ivoire",
  FM: 'Micronesia',
  HK: 'Hong Kong',
  IR: 'Iran',
  KP: 'North Korea',
  KR: 'South Korea',
  LA: 'Laos',
  MD: 'Moldova',
  MK: 'North Macedonia',
  NL: 'Netherlands',
  PS: 'Palestine',
  RU: 'Russia',
  SY: 'Syria',
  TW: 'Taiwan',
  TZ: 'Tanzania',
  UM: 'U.S. Outlying Islands',
  US: 'United States',
  GB: 'United Kingdom',
  VE: 'Venezuela',
  VN: 'Vietnam',
  TR: 'Turkey',
};

function flagEmoji(code) {
  const upper = code.toUpperCase();
  return String.fromCodePoint(...[...upper].map((ch) => 0x1f1e6 - 65 + ch.charCodeAt(0)));
}

function displayLabel(alpha2, officialName) {
  return DISPLAY_NAME_OVERRIDES[alpha2] ?? officialName.replace(/,.*$/, '').trim();
}

const url =
  'https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/slim-2/slim-2.json';

const res = await fetch(url);
if (!res.ok) throw new Error(`Failed to fetch ISO list: ${res.status}`);
const rows = await res.json();

const countries = rows
  .map((row) => {
    const code = String(row['alpha-2'] ?? '').toLowerCase();
    const label = displayLabel(row['alpha-2'], String(row.name ?? ''));
    if (!code || code.length !== 2 || !label) return null;
    return { value: code, label, flag: flagEmoji(code) };
  })
  .filter(Boolean)
  .sort((a, b) => a.label.localeCompare(b.label));

const body = `/** ISO 3166-1 alpha-2 countries for search filters and profile setup. */
export type CountryOption = {
  value: string;
  label: string;
  flag: string;
};

export const countries: CountryOption[] = ${JSON.stringify(countries, null, 2)};
`;

const out = join(__dirname, '..', 'src', 'config', 'countries.ts');
writeFileSync(out, body, 'utf8');
console.log(`Wrote ${countries.length} countries to ${out}`);
