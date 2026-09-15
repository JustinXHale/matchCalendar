import { NativeInput } from '@/ui/forms/NativeInput';
import { fromDateAndTimeInputs, fromDateTimeInputValue, toDateInputValue, toDateTimeInputValue } from '@/ui/forms/formDateUtils';

type Props = {
  id: string;
  label: string;
  value?: Date;
  onChange: (value?: Date) => void;
  dateOnly?: boolean;
};

export function DateTimeInput({ id, label, value, onChange, dateOnly = false }: Props) {
  return <NativeInput id={id} label={label} type={dateOnly ? 'date' : 'datetime-local'}
    value={dateOnly ? toDateInputValue(value) : toDateTimeInputValue(value)}
    onChange={(text) => onChange(dateOnly ? fromDateAndTimeInputs(text, '00:00') : fromDateTimeInputValue(text))} />;
}
