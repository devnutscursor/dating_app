import { useLocation } from 'react-router-dom';

export type LegalArea = 'man' | 'woman';
export type LegalPage = 'terms' | 'privacy' | 'rules';

export function useLegalArea(): LegalArea | null {
  const { pathname } = useLocation();
  if (pathname.startsWith('/woman/')) return 'woman';
  if (pathname.startsWith('/man/')) return 'man';
  return null;
}

export function legalHref(area: LegalArea | null, page: LegalPage): string {
  return area ? `/${area}/${page}` : `/${page}`;
}
