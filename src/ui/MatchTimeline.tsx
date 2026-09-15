import { useState } from 'react';
import { Button } from '@patternfly/react-core';
import type { TimelineItem } from '@/features/timeline/matchTimeline';
import { DateTimeInput } from '@/ui/forms/DateTimeInput';

type Props = {
  items: TimelineItem[];
  editable?: boolean;
  onEditItem?: (itemId: string, newAt: Date) => void;
};

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
    <ol className="rs-timeline">
      {items.map((item) => {
        const canEdit =
          editable &&
          onEditItem &&
          (item.kind === 'derived' || item.kind === 'custom');

        return (
          <li
            key={item.id}
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
        );
      })}
    </ol>
  );
}
