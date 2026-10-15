export const LANGUAGE_PREFERENCES = ['auto', 'en', 'es', 'fr', 'pt-BR'] as const;

export type LanguagePreference = (typeof LANGUAGE_PREFERENCES)[number];
export type AppLocale = Exclude<LanguagePreference, 'auto'>;

export function isLanguagePreference(value: unknown): value is LanguagePreference {
  return typeof value === 'string' && LANGUAGE_PREFERENCES.includes(value as LanguagePreference);
}

export function detectAppLocale(languages: readonly string[] = navigator.languages): AppLocale {
  for (const language of languages) {
    const normalized = language.toLowerCase();
    if (normalized.startsWith('es')) return 'es';
    if (normalized.startsWith('fr')) return 'fr';
    if (normalized.startsWith('pt')) return 'pt-BR';
    if (normalized.startsWith('en')) return 'en';
  }
  return 'en';
}

export function resolveAppLocale(preference: LanguagePreference): AppLocale {
  return preference === 'auto' ? detectAppLocale() : preference;
}
