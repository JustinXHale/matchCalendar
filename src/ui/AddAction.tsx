import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { openQuickMatch } from '@/app/navigation';
import { routes } from '@/app/routes';

export function AddAction() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
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
        aria-label="Add event"
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
          aria-label="Add event options"
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
            Quick Match
          </button>
          <Link
            to={routes.fullMatch}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Full details
          </Link>
        </div>
      )}
    </div>
  );
}
