import { useEffect, useRef, useState } from 'react';

export function useOnlineStatus() {
  const [online, setOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  const [showReconnected, setShowReconnected] = useState(false);
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    const onOnline = () => {
      setOnline(true);
      if (wasOfflineRef.current) {
        wasOfflineRef.current = false;
        setShowReconnected(true);
        window.setTimeout(() => setShowReconnected(false), 3000);
      }
    };

    const onOffline = () => {
      wasOfflineRef.current = true;
      setOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return { online, showReconnected };
}
