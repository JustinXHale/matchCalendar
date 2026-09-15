import { useDemoMode } from '@/demo/DemoModeContext';

export function DemoModeToggle() {
  const { isDemoMode, enableDemoMode, disableDemoMode } = useDemoMode();

  return (
    <button
      type="button"
      className="rs-demo-toggle"
      onClick={isDemoMode ? disableDemoMode : enableDemoMode}
      aria-pressed={isDemoMode}
    >
      {isDemoMode ? 'Exit demo' : 'View demo'}
    </button>
  );
}
