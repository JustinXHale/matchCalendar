import { Button } from '@patternfly/react-core';
import { usePwaInstall } from '@/pwa/usePwaInstall';

type PwaInstallCardProps = {
  className?: string;
};

export function PwaInstallCard({ className }: PwaInstallCardProps) {
  const { mode, install, dismiss } = usePwaInstall();

  if (mode === 'hidden') return null;

  return (
    <aside
      className={['rs-pwa-install', className].filter(Boolean).join(' ')}
      aria-label="Install Match Calendar"
    >
      <img
        className="rs-pwa-install__icon"
        src="/icons/icon-192.png"
        alt=""
        width={40}
        height={40}
        decoding="async"
      />
      <div className="rs-pwa-install__body">
        <p className="rs-pwa-install__title">Install Match Calendar</p>
        {mode === 'prompt' ? (
          <p className="rs-pwa-install__text">
            Add a home-screen shortcut for quicker access at the venue.
          </p>
        ) : (
          <p className="rs-pwa-install__text">
            Tap Share, then <strong>Add to Home Screen</strong> to install.
          </p>
        )}
        <div className="rs-pwa-install__actions">
          {mode === 'prompt' ? (
            <Button
              variant="secondary"
              onClick={() => {
                void install();
              }}
            >
              Install
            </Button>
          ) : null}
          <Button variant="link" onClick={dismiss}>
            Not now
          </Button>
        </div>
      </div>
    </aside>
  );
}
