export const LOCAL_OWNER_UID = 'local';

export const STORAGE_KEYS = {
  matches: 'match-calendar:matches',
  tournaments: 'match-calendar:tournaments',
  profile: 'match-calendar:profile',
} as const;

function isIsoDateString(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value);
}

function reviveDates<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => reviveDates(item)) as T;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, reviveDates(entry)]),
    ) as T;
  }

  if (isIsoDateString(value)) {
    return new Date(value) as T;
  }

  return value;
}

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return reviveDates(JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}
