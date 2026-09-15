import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type ToastVariant = 'error' | 'info';

type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type AppToastContextValue = {
  pushError: (message: string) => void;
  pushInfo: (message: string) => void;
};

const AppToastContext = createContext<AppToastContextValue | null>(null);

const TOAST_DURATION_MS = 7000;

export function AppToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (message: string, variant: ToastVariant) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, message, variant }]);
      window.setTimeout(() => dismiss(id), TOAST_DURATION_MS);
    },
    [dismiss],
  );

  const pushError = useCallback(
    (message: string) => push(message, 'error'),
    [push],
  );

  const pushInfo = useCallback(
    (message: string) => push(message, 'info'),
    [push],
  );

  const value = useMemo(
    () => ({ pushError, pushInfo }),
    [pushError, pushInfo],
  );

  return (
    <AppToastContext.Provider value={value}>
      {children}
      <div className="rs-toast-stack" aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={[
              'rs-update-toast',
              toast.variant === 'error' ? 'rs-update-toast--error' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            role="alert"
          >
            <span className="rs-update-toast__text">{toast.message}</span>
            <button
              type="button"
              className="rs-update-toast__btn rs-update-toast__btn--dismiss"
              onClick={() => dismiss(toast.id)}
            >
              Dismiss
            </button>
          </div>
        ))}
      </div>
    </AppToastContext.Provider>
  );
}

export function useAppToast(): AppToastContextValue {
  const context = useContext(AppToastContext);
  if (!context) {
    throw new Error('useAppToast must be used within AppToastProvider');
  }
  return context;
}
