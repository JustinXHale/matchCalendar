const DATE_TIME_PARTS = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

type WallClock = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(DATE_TIME_PARTS.resolvedOptions().locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZone,
  });
}

function wallClockAt(date: Date, timeZone: string): WallClock {
  const values = Object.fromEntries(
    formatterFor(timeZone)
      .formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)]),
  );
  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
  };
}

function wallClockEpoch(value: WallClock): number {
  return Date.UTC(
    value.year,
    value.month - 1,
    value.day,
    value.hour,
    value.minute,
    value.second,
  );
}

export function deviceTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

/** Profile home timezone, falling back to the device zone when unset. */
export function resolveHomeTimezone(homeTimezone?: string | null): string {
  const trimmed = homeTimezone?.trim();
  return trimmed || deviceTimeZone();
}

/** Interpret date/time form fields as wall-clock values in an IANA timezone. */
export function zonedWallToUtc(date: string, time: string, timeZone: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const desired: WallClock = {
    year,
    month,
    day,
    hour,
    minute,
    second: 0,
  };

  let instant = wallClockEpoch(desired);
  for (let index = 0; index < 4; index += 1) {
    const actual = wallClockAt(new Date(instant), timeZone);
    const adjustment = wallClockEpoch(desired) - wallClockEpoch(actual);
    instant += adjustment;
    if (adjustment === 0) break;
  }
  return new Date(instant);
}

/** Convert an absolute instant into date/time form fields in an IANA timezone. */
export function utcToZonedWall(
  date: Date,
  timeZone: string,
): { date: string; time: string } {
  const wall = wallClockAt(date, timeZone);
  return {
    date: [wall.year, wall.month, wall.day]
      .map((value, index) => index === 0 ? String(value) : String(value).padStart(2, '0'))
      .join('-'),
    time: [wall.hour, wall.minute]
      .map((value) => String(value).padStart(2, '0'))
      .join(':'),
  };
}

export function formatTimezoneShort(timeZone: string, date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'shortGeneric',
  }).formatToParts(date);
  return parts.find((part) => part.type === 'timeZoneName')?.value ?? timeZone;
}

/** True when two IANA zones would show different wall clocks for this instant. */
export function timezonesDiffer(
  left?: string | null,
  right?: string | null,
  at = new Date(),
): boolean {
  const a = left?.trim();
  const b = right?.trim();
  if (!a || !b || a === b) return false;
  const leftWall = utcToZonedWall(at, a);
  const rightWall = utcToZonedWall(at, b);
  return leftWall.date !== rightWall.date || leftWall.time !== rightWall.time;
}

export function dateKeyInTimezone(date: Date, timeZone?: string): string {
  if (timeZone) return utcToZonedWall(date, timeZone).date;
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

const COMMON_US_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Phoenix',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'America/Puerto_Rico',
] as const;

export function matchTimezoneOptions(): string[] {
  return [...new Set([deviceTimeZone(), ...COMMON_US_TIMEZONES])];
}
