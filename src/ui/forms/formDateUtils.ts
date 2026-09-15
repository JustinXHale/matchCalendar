export function toDateInputValue(date?: Date): string {
  if (!date || Number.isNaN(date.getTime())) return '';
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

export function toTimeInputValue(date?: Date): string {
  if (!date || Number.isNaN(date.getTime())) return '';
  return [
    String(date.getHours()).padStart(2, '0'),
    String(date.getMinutes()).padStart(2, '0'),
  ].join(':');
}

export function fromDateAndTimeInputs(
  date: string,
  time: string,
): Date | undefined {
  if (!date) return undefined;

  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = (time || '00:00').split(':').map(Number);
  const parsed = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function toDateTimeInputValue(date?: Date): string {
  if (!date || Number.isNaN(date.getTime())) return '';
  return [toDateInputValue(date), 'T', toTimeInputValue(date)].join('');
}

export function fromDateTimeInputValue(value: string): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}
