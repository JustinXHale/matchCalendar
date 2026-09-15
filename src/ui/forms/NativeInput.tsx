import type { HTMLInputTypeAttribute } from 'react';
import { FormGroup } from '@patternfly/react-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

type Props = {
  id: string;
  list?: string;
  label?: string;
  type?: HTMLInputTypeAttribute;
  value: string;
  onChange: (value: string) => void;
  validated?: 'default' | 'error' | 'success' | 'warning';
  error?: string;
  isRequired?: boolean;
  inputMode?: 'decimal' | 'numeric' | 'text';
};

const PICKER_TYPES = new Set(['date', 'time', 'datetime-local']);

export function NativeInput({
  id,
  list,
  label,
  type = 'text',
  value,
  onChange,
  validated = 'default',
  error,
  isRequired,
  inputMode,
}: Props) {
  const inputClass = [
    'rs-native-input',
    list ? 'rs-native-input--with-indicator' : '',
    validated === 'error' ? 'rs-native-input--error' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const commitValue = (nextValue: string) => {
    if (nextValue !== value) {
      onChange(nextValue);
    }
  };

  const input = (
    <div className={list ? 'rs-native-input-wrap' : undefined}>
      <input
        list={list}
        id={id}
        type={type}
        className={inputClass}
        value={value}
        inputMode={inputMode}
        required={isRequired}
        onChange={(event) => commitValue(event.target.value)}
        onInput={(event) => commitValue(event.currentTarget.value)}
        onBlur={(event) => {
          if (PICKER_TYPES.has(type)) {
            commitValue(event.target.value);
          }
        }}
      />
      {list ? (
        <FontAwesomeIcon
          icon={faChevronDown}
          className="rs-native-input__indicator"
          aria-hidden
        />
      ) : null}
    </div>
  );

  if (!label) return input;

  return (
    <FormGroup label={label} fieldId={id} isRequired={isRequired}>
      {input}
      {error ? (
        <span className="rs-form-error" role="alert">{error}</span>
      ) : null}
    </FormGroup>
  );
}
