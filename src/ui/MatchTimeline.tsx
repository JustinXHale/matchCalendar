import { Fragment, useState } from 'react';
import { Button } from '@patternfly/react-core';
import type { TimelineItem } from '@/features/timeline/matchTimeline';
import { DateTimeInput } from '@/ui/forms/DateTimeInput';
import { FlightDataAttribution } from '@/ui/FlightDataAttribution';
import { directionsUrl } from '@/utils/maps';
import {
  dateKeyInTimezone,
  formatTimezoneShort,
  timezonesDiffer,
} from '@/domain/matchTimezone';

type Props = {
  items: TimelineItem[];
  editable?: boolean;
  onEditItem?: (itemId: string, newAt: Date) => void;
  /** Primary display zone — home / travel clock. */
  timeZone?: string;
  /** Venue zone — dual-label kickoff-related rows when different from home. */
  venueTimeZone?: string;
};

const VENUE_DUAL_LABEL_IDS = new Set(['kickoff', 'arrive-pitch']);

function formatPrimaryTime(at: Date, timeZone?: string): string {
  const clock = at.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
  });
  return timeZone ? `${clock} ${formatTimezoneShort(timeZone, at)}` : clock;
}

function formatTimelineClock(
  item: TimelineItem,
  homeTimeZone?: string,
  venueTimeZone?: string,
): string {
  if (item.precision === 'date') return 'Date only';
  const primary = formatPrimaryTime(item.at, homeTimeZone);
  if (
    !VENUE_DUAL_LABEL_IDS.has(item.id) ||
    !timezonesDiffer(homeTimeZone, venueTimeZone, item.at)
  ) {
    return primary;
  }
  return `${primary} · ${formatPrimaryTime(item.at, venueTimeZone)}`;
}

function timelineDateKey(item: TimelineItem, timeZone?: string): string {
  return item.precision === 'date' && item.dateKey
    ? item.dateKey
    : dateKeyInTimezone(item.at, timeZone);
}

function dateForLabel(item: TimelineItem): Date {
  if (item.precision !== 'date' || !item.dateKey) return item.at;
  const [year, month, day] = item.dateKey.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function MatchTimeline({
  items,
  editable = false,
  onEditItem,
  timeZone,
  venueTimeZone,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftAt, setDraftAt] = useState<Date | undefined>();

  if (items.length === 0) return null;

  const showDayDividers = new Set(
    items.map((item) => timelineDateKey(item, timeZone)),
  ).size > 1;

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
        const dateKey = timelineDateKey(item, timeZone);
        const startsNewDay =
          showDayDividers &&
          (index === 0 || timelineDateKey(items[index - 1], timeZone) !== dateKey);
        const labelDate = dateForLabel(item);
        const labelTimeZone = item.precision === 'date' ? undefined : timeZone;

        return (
          <Fragment key={item.id}>
            {startsNewDay ? (
              <li className="rs-timeline__day-divider">
                <time
                  dateTime={dateKey}
                  aria-label={labelDate.toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    timeZone: labelTimeZone,
                  })}
                >
                  {labelDate.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    timeZone: labelTimeZone,
                  })}
                </time>
                <span aria-hidden="true" />
              </li>
            ) : null}
            <li
              className={`rs-timeline__item rs-timeline__item--${item.kind}`}
            >
              <span className="rs-timeline__time">
                {formatTimelineClock(item, timeZone, venueTimeZone)}
              </span>
              <div className="rs-timeline__body">
                <strong>{item.label}</strong>
                {item.detail ? <span>{item.detail}</span> : null}
                {item.mapLocation ? (
                  <a
                    className="rs-timeline__map-link"
                    href={directionsUrl(item.mapLocation.query)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${item.mapLocation.label} in maps`}
                  >
                    {item.mapLocation.label}
                  </a>
                ) : null}
                {item.secondaryDetail ? <span>{item.secondaryDetail}</span> : null}
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
                      timeZone={timeZone}
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
