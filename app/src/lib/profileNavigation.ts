/** Passed via React Router `location.state` when opening a member profile. */
export type ProfileLocationState = {
  returnTo?: string;
  /** Open profile on Photos or Videos tab (e.g. from discover lock badge). */
  mediaTab?: 'photos' | 'videos';
};

/** Build router state so profile “Go back” returns to the current page. */
export function profileReturnState(returnTo: string): { state: ProfileLocationState } {
  return { state: { returnTo } };
}

/** Safe return path for profile back link (must stay within same member area). */
export function resolveProfileReturnTo(
  area: 'man' | 'woman',
  locationState: unknown
): string {
  const path = (locationState as ProfileLocationState | null)?.returnTo?.trim();
  if (!path) return `/${area}/home`;
  if (!path.startsWith(`/${area}/`)) return `/${area}/home`;
  if (path.startsWith(`/${area}/view-profile/`)) return `/${area}/home`;
  return path;
}
