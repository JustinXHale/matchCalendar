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
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const options = matchTimezoneOptions();
  if (value && !options.includes(value)) options.unshift(value);

  return (
    <TextField
      id={id}
      select
      fullWidth
      size="small"
      required
      label="Timezone"
      value={value}
      error={Boolean(error)}
      helperText={error ?? 'Venue local time'}
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
