const SCHEME_STORAGE_KEY = 'rs-theme';

export type ColorScheme = 'light' | 'dark';

export type ThemeMode = ColorScheme;

export const HIGH_CONTRAST_ENABLED = true;

export function readStoredScheme(): ColorScheme {
  try {
    const value = localStorage.getItem(SCHEME_STORAGE_KEY);
    if (value === 'dark' || value === 'light') return value;
  } catch {
    /* ignore */
  }

  if (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }

  return 'light';
}

export function applyTheme(
  scheme: ColorScheme,
  highContrast = HIGH_CONTRAST_ENABLED,
): void {
  const root = document.documentElement;
  root.classList.toggle('pf-v6-theme-dark', scheme === 'dark');
  root.classList.toggle('pf-v6-theme-high-contrast', highContrast);
  root.dataset.rsColorScheme = scheme;
  root.dataset.rsHighContrast = highContrast ? 'true' : 'false';
}

export function persistTheme(scheme: ColorScheme): void {
  try {
    localStorage.setItem(SCHEME_STORAGE_KEY, scheme);
  } catch {
    /* ignore */
  }
  applyTheme(scheme);
}

export function initTheme(): ColorScheme {
  const scheme = readStoredScheme();
  applyTheme(scheme);
  return scheme;
}

export function watchSystemContrastPreferences(): void {
  if (typeof window === 'undefined') return;

  const reapply = () => applyTheme(readStoredScheme());
  window
    .matchMedia('(forced-colors: active)')
    .addEventListener('change', reapply);
  window
    .matchMedia('(prefers-contrast: more)')
    .addEventListener('change', reapply);
}
