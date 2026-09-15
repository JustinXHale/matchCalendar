import type { ScheduleView } from '@/features/schedule/scheduleView';

type Props = {
  view: ScheduleView;
  onChange: (view: ScheduleView) => void;
};

const OPTIONS: { key: ScheduleView; label: string }[] = [
  { key: 'calendar', label: 'Cal' },
  { key: 'agenda', label: 'Agenda' },
];

export function ScheduleViewToggle({ view, onChange }: Props) {
  return (
    <div
      className="rs-schedule-toggle"
      role="tablist"
      aria-label="Schedule view"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.key}
          type="button"
          role="tab"
          aria-selected={view === option.key}
          className={[
            'rs-schedule-toggle__option',
            view === option.key ? 'rs-schedule-toggle__option--active' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => onChange(option.key)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
