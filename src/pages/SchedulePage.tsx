import { useSearchParams } from 'react-router-dom';
import { AgendaScheduleView } from '@/features/schedule/AgendaScheduleView';
import { CalendarScheduleView } from '@/features/schedule/CalendarScheduleView';
import {
  parseScheduleView,
  type ScheduleView,
} from '@/features/schedule/scheduleView';
import { PageHeader } from '@/ui/PageHeader';
import { ScheduleViewToggle } from '@/ui/ScheduleViewToggle';

export function SchedulePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = parseScheduleView(searchParams.get('view'));

  const setView = (nextView: ScheduleView) => {
    if (nextView === 'calendar') {
      setSearchParams({ view: 'calendar' }, { replace: true });
      return;
    }
    setSearchParams({}, { replace: true });
  };

  return (
    <div
      className={[
        'rs-stack',
        view === 'calendar' ? 'rs-calendar-page' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <PageHeader
        title="Schedule"
        actions={<ScheduleViewToggle view={view} onChange={setView} />}
      />

      {view === 'calendar' ? (
        <CalendarScheduleView />
      ) : (
        <AgendaScheduleView />
      )}
    </div>
  );
}
