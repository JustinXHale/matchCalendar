import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

export function useUnsavedChangesGuard(isDirty: boolean, enabled = true) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      enabled &&
      isDirty &&
      currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (!enabled || !isDirty) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [enabled, isDirty]);

  useEffect(() => {
    if (blocker.state !== 'blocked') return;

    const leave = window.confirm(
      'You have unsaved changes. Leave without saving?',
    );

    if (leave) {
      blocker.proceed();
      return;
    }

    blocker.reset();
  }, [blocker]);
}
