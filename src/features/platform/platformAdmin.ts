function parseAllowList(raw: string | undefined): string[] {
  return String(raw ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

export function isPlatformAdmin(
  uid: string | undefined,
  email: string | null | undefined,
): boolean {
  if (!uid) return false;

  const allowedUids = parseAllowList(
    import.meta.env.VITE_PLATFORM_ADMIN_UIDS as string | undefined,
  );
  if (allowedUids.includes(uid)) return true;

  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) return false;

  const allowedEmails = parseAllowList(
    import.meta.env.VITE_PLATFORM_ADMIN_EMAILS as string | undefined,
  ).map((value) => value.toLowerCase());

  return allowedEmails.includes(normalizedEmail);
}
