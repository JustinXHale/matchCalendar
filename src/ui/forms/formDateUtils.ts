import { utcToZonedWall, zonedWallToUtc } from '@/domain/matchTimezone';

export function toDateInputValue(date?: Date, timeZone?: string): string {
  if (!date || Number.isNaN(date.getTime())) return '';
  if (timeZone) return utcToZonedWall(date, timeZone).date;
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

export function toTimeInputValue(date?: Date, timeZone?: string): string {
  if (!date || Number.isNaN(date.getTime())) return '';
  if (timeZone) return utcToZonedWall(date, timeZone).time;
  return [
    String(date.getHours()).padStart(2, '0'),
    String(date.getMinutes()).padStart(2, '0'),
  ].join(':');
}

export function fromDateAndTimeInputs(
  date: string,
  time: string,
  timeZone?: string,
): Date | undefined {
  if (!date) return undefined;

  if (timeZone) {
    const parsed = zonedWallToUtc(date, time || '00:00', timeZone);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = (time || '00:00').split(':').map(Number);
  const parsed = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function toDateTimeInputValue(date?: Date, timeZone?: string): string {
  if (!date || Number.isNaN(date.getTime())) return '';
  return [toDateInputValue(date, timeZone), 'T', toTimeInputValue(date, timeZone)].join('');
}

export function fromDateTimeInputValue(value: string, timeZone?: string): Date | undefined {
  if (!value) return undefined;
  if (timeZone) {
    const [date, time = '00:00'] = value.split('T');
    return fromDateAndTimeInputs(date, time, timeZone);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}
