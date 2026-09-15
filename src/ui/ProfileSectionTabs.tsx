export type ProfileSectionTab = 'profile' | 'members' | 'insights';

type TabOption = {
  key: ProfileSectionTab;
  label: string;
};

type Props = {
  tab: ProfileSectionTab;
  options: TabOption[];
  onChange: (tab: ProfileSectionTab) => void;
  panelId: string;
};

export function ProfileSectionTabs({ tab, options, onChange, panelId }: Props) {
  return (
    <div
      className="rs-profile-tabs"
      role="tablist"
      aria-label="Profile sections"
    >
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          role="tab"
          aria-selected={tab === option.key}
          aria-controls={panelId}
          tabIndex={tab === option.key ? 0 : -1}
          className={[
            'rs-profile-tabs__option',
            tab === option.key ? 'rs-profile-tabs__option--active' : '',
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
