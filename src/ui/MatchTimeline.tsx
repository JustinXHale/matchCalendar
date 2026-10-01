import { Fragment, useState } from 'react';
import { Button } from '@patternfly/react-core';
import type { TimelineItem } from '@/features/timeline/matchTimeline';
import { DateTimeInput } from '@/ui/forms/DateTimeInput';
import { FlightDataAttribution } from '@/ui/FlightDataAttribution';

type Props = {
  items: TimelineItem[];
  editable?: boolean;
  onEditItem?: (itemId: string, newAt: Date) => void;
};

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function MatchTimeline({ items, editable = false, onEditItem }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftAt, setDraftAt] = useState<Date | undefined>();

  if (items.length === 0) return null;

  const startEdit = (item: TimelineItem) => {
    setEditingId(item.id);
    setDraftAt(item.at);
  };

  const saveEdit = (itemId: string) => {
    if (!draftAt || !onEditItem) return;
    onEditItem(itemId, draftAt);
    setEditingId(null);
    setDraftAt(undefined);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftAt(undefined);
  };

  return (
    <>
    <ol className="rs-timeline">
      {items.map((item, index) => {
        const canEdit =
          editable &&
          onEditItem &&
          (item.kind === 'derived' || item.kind === 'custom');
        const dateKey = localDateKey(item.at);
        const startsNewDay =
          index > 0 && localDateKey(items[index - 1].at) !== dateKey;

        return (
          <Fragment key={item.id}>
            {startsNewDay ? (
              <li className="rs-timeline__day-divider">
                <time
                  dateTime={dateKey}
                  aria-label={item.at.toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                >
                  {item.at.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
                <span aria-hidden="true" />
              </li>
            ) : null}
            <li
              className={`rs-timeline__item rs-timeline__item--${item.kind}`}
            >
              <span className="rs-timeline__time">
                {item.at.toLocaleTimeString(undefined, {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
              <div className="rs-timeline__body">
                <strong>{item.label}</strong>
                {item.detail ? <span>{item.detail}</span> : null}
                {canEdit && editingId !== item.id ? (
                  <Button variant="link" isInline onClick={() => startEdit(item)}>
                    Change time
                  </Button>
                ) : null}
                {canEdit && editingId === item.id ? (
                  <div className="rs-timeline__edit">
                    <DateTimeInput
                      id={`timeline-edit-${item.id}`}
                      label="Time"
                      value={draftAt}
                      onChange={setDraftAt}
                    />
                    <div className="rs-timeline__edit-actions">
                      <Button variant="primary" onClick={() => saveEdit(item.id)}>
                        Save
                      </Button>
                      <Button variant="link" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </li>
          </Fragment>
        );
      })}
    </ol>
    {items.some((item) => item.dataProvider === 'aerodatabox') ? (
      <FlightDataAttribution />
    ) : null}
    </>
  );
}
