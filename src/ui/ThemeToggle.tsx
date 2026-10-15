import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleHalfStroke, faMoon } from '@fortawesome/free-solid-svg-icons';
import { persistTheme, type ThemeMode } from '@/app/theme';
import { useI18n } from '@/i18n/I18nProvider';

type Props = {
  className?: string;
};

export function ThemeToggle({ className }: Props) {
  const { t } = useI18n();
  const [theme, setTheme] = useState<ThemeMode>(() =>
    document.documentElement.classList.contains('pf-v6-theme-dark')
      ? 'dark'
      : 'light',
  );

  const toggle = () => {
    const next: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    persistTheme(next);
    setTheme(next);
  };

  return (
    <button
      type="button"
      className={['rs-theme-toggle', className].filter(Boolean).join(' ')}
      onClick={toggle}
      aria-label={
        theme === 'dark' ? t('theme.toLight') : t('theme.toDark')
      }
    >
      <FontAwesomeIcon
        icon={theme === 'dark' ? faCircleHalfStroke : faMoon}
        aria-hidden
      />
    </button>
  );
}
