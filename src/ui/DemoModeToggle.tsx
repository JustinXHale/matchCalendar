import { useDemoMode } from '@/demo/DemoModeContext';
import { useI18n } from '@/i18n/I18nProvider';

export function DemoModeToggle() {
  const { isDemoMode, enableDemoMode, disableDemoMode } = useDemoMode();
  const { t } = useI18n();

  return (
    <button
      type="button"
      className="rs-demo-toggle"
      onClick={isDemoMode ? disableDemoMode : enableDemoMode}
      aria-pressed={isDemoMode}
    >
      {isDemoMode ? t('demo.exit') : t('demo.view')}
    </button>
  );
}
