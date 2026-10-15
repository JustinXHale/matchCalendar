import {
  formatMonthLabel,
  getMatchDates,
  getMatchesForDate,
  getMonthGrid,
  isSameCalendarDay,
  toDateKey,
} from '@/features/calendar/calendarUtils';
import type { Match } from '@/domain/match';
import { useI18n } from '@/i18n/I18nProvider';

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
  const { locale, t } = useI18n();
  const days = getMonthGrid(year, month);
  const matchDates = getMatchDates(matches);
  const today = new Date();
  const weekdays = Array.from({ length: 7 }, (_, index) =>
    new Date(2023, 0, index + 1).toLocaleDateString(locale, { weekday: 'short' }),
  );

  return (
    <div className="rs-calendar">
      <div className="rs-calendar__header">
        <button type="button" className="rs-calendar__nav" onClick={onPrevMonth}>
          ‹
        </button>
        <div className="rs-calendar__title-wrap">
          <h2 className="rs-calendar__title">{formatMonthLabel(year, month, locale)}</h2>
          <button type="button" className="rs-calendar__today" onClick={onToday}>
            {t('common.today')}
          </button>
        </div>
        <button type="button" className="rs-calendar__nav" onClick={onNextMonth}>
          ›
        </button>
      </div>

      <div className="rs-calendar__weekdays" aria-hidden>
        {weekdays.map((day) => (
          <span key={day} className="rs-calendar__weekday">{day}</span>
        ))}
      </div>

      <div className="rs-calendar__grid" role="grid" aria-label={t('calendar.monthCalendar')}>
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
              aria-label={`${day.toLocaleDateString(locale, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}${dayMatches.length > 0 ? `, ${dayMatches.length === 1 ? t('calendar.oneMatch') : t('calendar.matchCount', { count: dayMatches.length })}` : ''}`}
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
