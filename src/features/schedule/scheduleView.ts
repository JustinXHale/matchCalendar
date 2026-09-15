export type ScheduleView = 'agenda' | 'calendar';

export function parseScheduleView(
  value: string | null | undefined,
): ScheduleView {
  return value === 'calendar' ? 'calendar' : 'agenda';
}
