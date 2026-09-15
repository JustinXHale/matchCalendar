/** Mobile browsers and installed PWAs cannot reliably complete popup OAuth. */
export function prefersAuthRedirect(): boolean {
  if (typeof window === 'undefined') return false;

  const ua = navigator.userAgent;
  const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

  return mobile || standalone;
}

export function isMissingRedirectStateError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return message.includes('missing initial state');
}
