import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = 'match-calendar-demo-mode';

type DemoModeContextValue = {
  isDemoMode: boolean;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
  toggleDemoMode: () => void;
};

const DemoModeContext = createContext<DemoModeContextValue | null>(null);

export function DemoModeProvider({ children }: PropsWithChildren) {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const setMode = (enabled: boolean) => {
    setIsDemoMode(enabled);
    try {
      localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch {
      /* ignore */
    }
  };

  const value = useMemo<DemoModeContextValue>(
    () => ({
      isDemoMode,
      enableDemoMode: () => setMode(true),
      disableDemoMode: () => setMode(false),
      toggleDemoMode: () => setMode(!isDemoMode),
    }),
    [isDemoMode],
  );

  return (
    <DemoModeContext.Provider value={value}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);

  if (!context) {
    throw new Error('useDemoMode must be used inside DemoModeProvider');
  }

  return context;
}
