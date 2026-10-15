import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { openQuickMatch } from '@/app/navigation';
import { routes } from '@/app/routes';
import { backFromLocation } from '@/nav/backDefaults';
import { backState } from '@/nav/backNav';
import { useI18n } from '@/i18n/I18nProvider';

export function AddAction() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="rs-add-event">
      <button
        type="button"
        className="rs-add-event__btn"
        aria-label={t('common.addEvent')}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="rs-add-event__icon" aria-hidden>+</span>
      </button>
      {open && (
        <div
          className="rs-add-menu"
          role="menu"
          aria-label={t('common.addEventOptions')}
        >
          <button
            type="button"
            role="menuitem"
            className="rs-add-menu__item"
            onClick={() => {
              setOpen(false);
              openQuickMatch(navigate, location);
            }}
          >
            {t('common.quickMatch')}
          </button>
          <Link
            to={routes.fullMatch}
            role="menuitem"
            state={backState(backFromLocation(location))}
            onClick={() => setOpen(false)}
          >
            {t('common.fullDetails')}
          </Link>
        </div>
      )}
    </div>
  );
}
