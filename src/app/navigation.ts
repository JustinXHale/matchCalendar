import type { Location, NavigateFunction } from 'react-router-dom';
import { routes } from '@/app/routes';

export function openQuickMatch(navigate: NavigateFunction, location: Location) {
  navigate(routes.quickMatch, {
    state: { background: location },
  });
}

export function closeQuickMatch(navigate: NavigateFunction) {
  if (window.history.length > 1) {
    navigate(-1);
    return;
  }

  navigate(routes.schedule, { replace: true });
}
