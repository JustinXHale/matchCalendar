import type { KeyboardEvent } from 'react';

const PICKER_INPUT_TYPES = new Set(['date', 'time', 'datetime-local']);

const FORM_ROOT_SELECTOR =
  '.rs-form-stack, .rs-modal, .rs-detail-card, .rs-form-section, .rs-money-closure__panel';

const FIELD_SELECTOR =
  'input:not([type="hidden"]):not([disabled]):not([type="date"]):not([type="time"]):not([type="datetime-local"]), select:not([disabled]), textarea:not([disabled])';

export function isPickerInputType(type: string): boolean {
  return PICKER_INPUT_TYPES.has(type);
}

function isVisibleField(element: HTMLElement): boolean {
  if (element instanceof HTMLInputElement && element.type === 'hidden') return false;
  return element.getClientRects().length > 0;
}

export function focusNextFormField(current: HTMLElement): boolean {
  const root = current.closest(FORM_ROOT_SELECTOR) ?? document.body;
  const fields = Array.from(root.querySelectorAll<HTMLElement>(FIELD_SELECTOR)).filter(
    isVisibleField,
  );
  const index = fields.indexOf(current);
  if (index === -1 || index >= fields.length - 1) {
    current.blur();
    return false;
  }

  fields[index + 1].focus();
  return true;
}

export function handleFormFieldEnterKey(
  event: KeyboardEvent<HTMLElement>,
): void {
  if (event.key !== 'Enter') return;

  const target = event.currentTarget;
  if (target instanceof HTMLInputElement && isPickerInputType(target.type)) {
    return;
  }

  event.preventDefault();
  focusNextFormField(target);
}
