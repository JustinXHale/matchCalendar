import { useEffect, useRef, useState } from 'react';
import { Button, TextInput } from '@patternfly/react-core';

type DangerConfirmModalProps = {
  title: string;
  description: string;
  confirmLabel: string;
  typedConfirmPhrase?: string;
  isOpen: boolean;
  isBusy: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function DangerConfirmModal({
  title,
  description,
  confirmLabel,
  typedConfirmPhrase,
  isOpen,
  isBusy,
  error,
  onClose,
  onConfirm,
}: DangerConfirmModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [typedValue, setTypedValue] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setTypedValue('');
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isBusy) onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    panelRef.current?.focus();
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isBusy, isOpen, onClose]);

  if (!isOpen) return null;

  const typedOk =
    !typedConfirmPhrase || typedValue.trim() === typedConfirmPhrase;

  return (
    <div className="rs-modal-backdrop" onClick={isBusy ? undefined : onClose}>
      <div
        ref={panelRef}
        className="rs-modal rs-modal--sheet"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="danger-confirm-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="rs-modal__header">
          <h2 id="danger-confirm-title" className="rs-modal__title">
            {title}
          </h2>
          <button
            type="button"
            className="rs-modal__close"
            aria-label="Close"
            onClick={onClose}
            disabled={isBusy}
          >
            ×
          </button>
        </header>
        <div className="rs-modal__body rs-stack">
          <p className="rs-form-hint">{description}</p>
          {typedConfirmPhrase ? (
            <label className="rs-form-hint" htmlFor="danger-confirm-input">
              Type <strong>{typedConfirmPhrase}</strong> to confirm
            </label>
          ) : null}
          {typedConfirmPhrase ? (
            <TextInput
              id="danger-confirm-input"
              value={typedValue}
              onChange={(_event, value) => setTypedValue(value)}
              isDisabled={isBusy}
              autoComplete="off"
            />
          ) : null}
          {error ? <p className="rs-form-error" role="alert">{error}</p> : null}
          <div className="rs-form-actions">
            <Button
              variant="danger"
              isBlock
              onClick={onConfirm}
              isDisabled={isBusy || !typedOk}
              isLoading={isBusy}
            >
              {confirmLabel}
            </Button>
            <Button variant="secondary" isBlock onClick={onClose} isDisabled={isBusy}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
