import { useEffect, useState, type HTMLInputTypeAttribute, type KeyboardEvent } from 'react';
import { InputAdornment, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs, { type Dayjs } from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { handleFormFieldEnterKey } from '@/ui/forms/formFieldNav';

type Props = {
  id: string;
  list?: string;
  label?: string;
  type?: HTMLInputTypeAttribute;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  validated?: 'default' | 'error' | 'success' | 'warning';
  error?: string;
  isRequired?: boolean;
  inputMode?: 'decimal' | 'numeric' | 'text';
  autoUppercase?: boolean;
  enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
  isLast?: boolean;
};

const PICKER_TYPES = new Set(['date', 'time', 'datetime-local']);

type PickerType = 'date' | 'time' | 'datetime-local';

function pickerValue(value: string, type: PickerType): Dayjs | null {
  if (!value) return null;
  const parsed = dayjs(type === 'time' ? `2000-01-01T${value}` : value);
  return parsed.isValid() ? parsed : null;
}

function pickerOutput(value: Dayjs, type: PickerType): string {
  if (type === 'date') return value.format('YYYY-MM-DD');
  if (type === 'time') return value.format('HH:mm');
  return value.format('YYYY-MM-DDTHH:mm');
}

function MaterialPickerInput({
  id,
  label,
  type,
  value,
  onChange,
  error,
  hasError,
  isRequired,
}: Pick<Props, 'id' | 'label' | 'value' | 'onChange' | 'error' | 'isRequired'> & {
  type: PickerType;
  hasError: boolean;
}) {
  const [draft, setDraft] = useState<Dayjs | null>(() => pickerValue(value, type));

  useEffect(() => {
    setDraft(pickerValue(value, type));
  }, [type, value]);

  const update = (next: Dayjs | null) => {
    setDraft(next);
    if (next == null) {
      onChange('');
    } else if (next.isValid()) {
      onChange(pickerOutput(next, type));
    }
  };

  const fieldProps = {
    id,
    required: isRequired,
    error: hasError,
    helperText: error,
    fullWidth: true,
    size: 'small' as const,
  };

  if (type === 'date') {
    return (
      <DatePicker
        label={label}
        value={draft}
        onChange={update}
        format="MM/DD/YYYY"
        slotProps={{ textField: fieldProps }}
      />
    );
  }

  if (type === 'time') {
    return (
      <TimePicker
        label={label}
        value={draft}
        onChange={update}
        format="hh:mm A"
        slotProps={{ textField: fieldProps }}
      />
    );
  }

  return (
    <DateTimePicker
      label={label}
      value={draft}
      onChange={update}
      format="MM/DD/YYYY hh:mm A"
      slotProps={{ textField: fieldProps }}
    />
  );
}

export function NativeInput({
  id,
  list,
  label,
  type = 'text',
  value,
  placeholder,
  onChange,
  validated = 'default',
  error,
  isRequired,
  inputMode,
  autoUppercase = false,
  enterKeyHint,
  isLast = false,
}: Props) {
  const picker = PICKER_TYPES.has(type);
  const resolvedEnterKeyHint =
    enterKeyHint ?? (picker || isLast ? 'done' : 'next');
  const inputClass = [
    autoUppercase ? 'rs-native-input--uppercase' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const commitValue = (nextValue: string) => {
    const normalized = autoUppercase ? nextValue.toUpperCase() : nextValue;
    if (normalized !== value) {
      onChange(normalized);
    }
  };

  if (picker) {
    return (
      <MaterialPickerInput
        id={id}
        label={label}
        type={type as PickerType}
        value={value}
        onChange={onChange}
        error={error}
        hasError={validated === 'error'}
        isRequired={isRequired}
      />
    );
  }

  return (
    <TextField
      id={id}
      type={type}
      label={label}
      fullWidth
      size="small"
      value={value}
      placeholder={placeholder}
      required={isRequired}
      error={validated === 'error'}
      helperText={error}
      className="rs-native-input-field"
      slotProps={{
        input: list
          ? {
              endAdornment: (
                <InputAdornment position="end">
                  <FontAwesomeIcon icon={faChevronDown} aria-hidden />
                </InputAdornment>
              ),
            }
          : undefined,
        htmlInput: {
          list,
          className: inputClass,
          inputMode,
          autoCapitalize: autoUppercase ? 'characters' : undefined,
          autoCorrect: autoUppercase ? 'off' : undefined,
          spellCheck: autoUppercase ? false : undefined,
          enterKeyHint: resolvedEnterKeyHint,
          'aria-invalid': validated === 'error' || undefined,
          onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
            handleFormFieldEnterKey(event);
          },
        },
      }}
      onChange={(event) => commitValue(event.target.value)}
      onInput={(event) => commitValue((event.target as HTMLInputElement).value)}
    />
  );
}
