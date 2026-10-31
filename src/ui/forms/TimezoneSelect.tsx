import { TextField } from '@mui/material';
import {
  formatTimezoneShort,
  matchTimezoneOptions,
} from '@/domain/matchTimezone';

export function TimezoneSelect({
  id,
  value,
  onChange,
  error,
  label = 'Timezone',
  helperText = 'Venue local time',
  isRequired = true,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  helperText?: string;
  isRequired?: boolean;
}) {
  const options = matchTimezoneOptions();
  if (value && !options.includes(value)) options.unshift(value);

  return (
    <TextField
      id={id}
      select
      fullWidth
      size="small"
      required={isRequired}
      label={label}
      value={value}
      error={Boolean(error)}
      helperText={error ?? helperText}
      slotProps={{ select: { native: true } }}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((timeZone) => (
        <option key={timeZone} value={timeZone}>
          {formatTimezoneShort(timeZone)} — {timeZone.replaceAll('_', ' ')}
        </option>
      ))}
    </TextField>
  );
}
