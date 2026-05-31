/** Bump when disclaimer text changes to re-prompt visitors. */
export const AGE_GATE_VERSION = 1;
const STORAGE_KEY = 'memberdate_age_gate_accepted';

type AgeGateRecord = {
  v: number;
  accepted: true;
  at: string;
};

export function hasAcceptedAgeGate(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw) as AgeGateRecord;
    return data?.v === AGE_GATE_VERSION && data.accepted === true;
  } catch {
    return false;
  }
}

export function acceptAgeGate(): void {
  const record: AgeGateRecord = {
    v: AGE_GATE_VERSION,
    accepted: true,
    at: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

/** Years since birth date (UTC calendar), or null if invalid. */
export function ageFromBirthDate(birthDate: string): number | null {
  if (!birthDate) return null;
  const born = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(born.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - born.getFullYear();
  const monthDiff = today.getMonth() - born.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < born.getDate())) {
    age -= 1;
  }
  return age;
}

export function isAtLeast18(birthDate: string): boolean {
  const age = ageFromBirthDate(birthDate);
  return age !== null && age >= 18;
}

/** Latest allowed DOB for 18+ (inclusive). */
export function maxBirthDateFor18Plus(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().slice(0, 10);
}
