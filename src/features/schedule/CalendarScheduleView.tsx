import { useMemo, useState } from 'react';
import { useMatches } from '@/features/matches/useMatches';
import { getMatchesForDate } from '@/features/calendar/calendarUtils';
import { useTournamentsContext } from '@/features/tournaments/TournamentsProvider';
import { CalendarGrid } from '@/ui/CalendarGrid';
import { ScheduleItemList } from '@/ui/ScheduleItemList';

export function CalendarScheduleView() {
  const { matches } = useMatches();
  const { getTournamentById } = useTournamentsContext();
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
      <section aria-label="Matches on selected date">
        <h2 className="rs-section-label">
          {selectedDate.toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </h2>
        {dayMatches.length === 0 ? (
          <div className="rs-placeholder-card">
            <p>No matches on this date.</p>
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
