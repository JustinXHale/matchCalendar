import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { useProfile } from '@/features/profile/ProfileProvider';
import { resolveAppLocale, type AppLocale } from '@/i18n/languages';
import { translations, type TranslationKey } from '@/i18n/translations';

type Values = Record<string, string | number>;

type I18nContextValue = {
  locale: AppLocale;
  t: (key: TranslationKey, values?: Values) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function interpolate(message: string, values?: Values): string {
  if (!values) return message;
  return message.replace(/\{(\w+)\}/g, (token, key: string) =>
    values[key] == null ? token : String(values[key]),
  );
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const { profile } = useProfile();
  const locale = resolveAppLocale(profile.languagePreference);
  const value = useMemo<I18nContextValue>(() => ({
    locale,
    t: (key, values) => interpolate(translations[locale][key] ?? translations.en[key], values),
  }), [locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
}
