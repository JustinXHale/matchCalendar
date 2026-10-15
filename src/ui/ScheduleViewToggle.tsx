import type { ScheduleView } from '@/features/schedule/scheduleView';
import { useI18n } from '@/i18n/I18nProvider';
import type { TranslationKey } from '@/i18n/translations';

type Props = {
  view: ScheduleView;
  onChange: (view: ScheduleView) => void;
  panelId?: string;
};

const OPTIONS: { key: ScheduleView; label: TranslationKey }[] = [
  { key: 'calendar', label: 'schedule.calendarShort' },
  { key: 'agenda', label: 'schedule.agenda' },
];

export function ScheduleViewToggle({ view, onChange, panelId }: Props) {
  const { t } = useI18n();
  return (
    <div
      className="rs-schedule-toggle"
      role="tablist"
      aria-label={t('schedule.view')}
    >
      {OPTIONS.map((option) => (
        <button
          key={option.key}
          type="button"
          role="tab"
          aria-selected={view === option.key}
          aria-controls={panelId}
          tabIndex={view === option.key ? 0 : -1}
          className={[
            'rs-schedule-toggle__option',
            view === option.key ? 'rs-schedule-toggle__option--active' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => onChange(option.key)}
        >
          {t(option.label)}
        </button>
      ))}
    </div>
  );
}
