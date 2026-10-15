import { useMemo, useState } from 'react';
import { useMatches } from '@/features/matches/useMatches';
import { getMatchesForDate } from '@/features/calendar/calendarUtils';
import { useTournamentsContext } from '@/features/tournaments/TournamentsProvider';
import { CalendarGrid } from '@/ui/CalendarGrid';
import { ScheduleItemList } from '@/ui/ScheduleItemList';
import { useI18n } from '@/i18n/I18nProvider';

export function CalendarScheduleView() {
  const { matches } = useMatches();
  const { getTournamentById } = useTournamentsContext();
  const { locale, t } = useI18n();
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(today);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const dayMatches = useMemo(
    () => getMatchesForDate(matches, selectedDate),
    [matches, selectedDate],
  );

  const goPrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const goNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const goToday = () => {
    const now = new Date();
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now);
  };

  return (
    <div className="rs-calendar-page__body">
      <CalendarGrid
        year={year}
        month={month}
        matches={matches}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onPrevMonth={goPrevMonth}
        onNextMonth={goNextMonth}
        onToday={goToday}
      />
      <section aria-label={t('calendar.matchesOnDate')}>
        <h2 className="rs-section-label">
          {selectedDate.toLocaleDateString(locale, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </h2>
        {dayMatches.length === 0 ? (
          <div className="rs-placeholder-card">
            <p>{t('calendar.noMatches')}</p>
          </div>
        ) : (
          <ScheduleItemList
            matches={dayMatches}
            getTournamentById={getTournamentById}
            allowTimelineExpand
          />
        )}
      </section>
    </div>
  );
}
