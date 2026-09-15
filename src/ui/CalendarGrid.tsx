import {
  formatMonthLabel,
  getMatchDates,
  getMatchesForDate,
  getMonthGrid,
  isSameCalendarDay,
  toDateKey,
} from '@/features/calendar/calendarUtils';
import type { Match } from '@/domain/match';

type Props = {
  year: number;
  month: number;
  matches: Match[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarGrid({
  year,
  month,
  matches,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onToday,
}: Props) {
  const days = getMonthGrid(year, month);
  const matchDates = getMatchDates(matches);
  const today = new Date();

  return (
    <div className="rs-calendar">
      <div className="rs-calendar__header">
        <button type="button" className="rs-calendar__nav" onClick={onPrevMonth}>
          ‹
        </button>
        <div className="rs-calendar__title-wrap">
          <h2 className="rs-calendar__title">{formatMonthLabel(year, month)}</h2>
          <button type="button" className="rs-calendar__today" onClick={onToday}>
            Today
          </button>
        </div>
        <button type="button" className="rs-calendar__nav" onClick={onNextMonth}>
          ›
        </button>
      </div>

      <div className="rs-calendar__weekdays" aria-hidden>
        {WEEKDAYS.map((day) => (
          <span key={day} className="rs-calendar__weekday">{day}</span>
        ))}
      </div>

      <div className="rs-calendar__grid" role="grid" aria-label="Month calendar">
        {days.map((day) => {
          const inMonth = day.getMonth() === month;
          const key = toDateKey(day);
          const hasMatches = matchDates.has(key);
          const isSelected = isSameCalendarDay(day, selectedDate);
          const isToday = isSameCalendarDay(day, today);
          const dayMatches = getMatchesForDate(matches, day);

          return (
            <button
              key={key}
              type="button"
              role="gridcell"
              className={[
                'rs-calendar__day',
                inMonth ? '' : 'rs-calendar__day--outside',
                isSelected ? 'rs-calendar__day--selected' : '',
                isToday ? 'rs-calendar__day--today' : '',
                hasMatches ? 'rs-calendar__day--has-match' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onSelectDate(day)}
              aria-label={`${day.toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}${dayMatches.length > 0 ? `, ${dayMatches.length} matches` : ''}`}
            >
              <span className="rs-calendar__day-num">{day.getDate()}</span>
              {hasMatches ? (
                <span className="rs-calendar__marker" aria-hidden />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
