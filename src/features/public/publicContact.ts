export const PUBLIC_CONTACT_EMAIL = 'justinxhale@gmail.com';

/** Prefilled when users tap the footer contact link. */
export const PUBLIC_CONTACT_EMAIL_SUBJECT = 'Match Calendar';

export function publicContactMailto(): string {
  const params = new URLSearchParams({ subject: PUBLIC_CONTACT_EMAIL_SUBJECT });
  return `mailto:${PUBLIC_CONTACT_EMAIL}?${params.toString()}`;
}

/** Canonical legal pages on rabbitholeapps.com (store listings, external links). */
export const PUBLIC_LEGAL_SITE_BASE =
  'https://rabbitholeapps.com/apps/match-calendar';

export const PUBLIC_PRIVACY_URL = `${PUBLIC_LEGAL_SITE_BASE}/privacy/`;
export const PUBLIC_TERMS_URL = `${PUBLIC_LEGAL_SITE_BASE}/terms/`;
export const PUBLIC_DELETE_ACCOUNT_URL = `${PUBLIC_LEGAL_SITE_BASE}/delete-account/`;
