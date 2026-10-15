import { useSearchParams } from 'react-router-dom';
import { AgendaScheduleView } from '@/features/schedule/AgendaScheduleView';
import { CalendarScheduleView } from '@/features/schedule/CalendarScheduleView';
import {
  parseScheduleView,
  type ScheduleView,
} from '@/features/schedule/scheduleView';
import { PageHeader } from '@/ui/PageHeader';
import { ScheduleViewToggle } from '@/ui/ScheduleViewToggle';
import { useI18n } from '@/i18n/I18nProvider';

export function SchedulePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useI18n();
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
        title={t('nav.schedule')}
        actions={
          <ScheduleViewToggle
            view={view}
            onChange={setView}
            panelId="schedule-panel"
          />
        }
      />

      <div
        id="schedule-panel"
        className="rs-schedule-panel"
        role="tabpanel"
        tabIndex={-1}
      >
        {view === 'calendar' ? (
          <CalendarScheduleView />
        ) : (
          <AgendaScheduleView />
        )}
      </div>
    </div>
  );
}
