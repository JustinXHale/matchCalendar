import { useLiveData } from '@/features/auth/useLiveData';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function OfflineBanner() {
  const { isLive } = useLiveData();
  const { online, showReconnected } = useOnlineStatus();

  if (!isLive) return null;

  if (showReconnected) {
    return (
      <div className="rs-offline-banner rs-offline-banner--online" role="status">
        <strong>Back online</strong>
        <span>Changes will sync automatically.</span>
      </div>
    );
  }

  if (online) return null;

  return (
    <div className="rs-offline-banner" role="status">
      <strong>Offline</strong>
      <span>You can still view and edit. Changes sync when you reconnect.</span>
    </div>
  );
}
