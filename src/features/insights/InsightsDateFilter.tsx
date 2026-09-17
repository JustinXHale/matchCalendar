import { Button } from '@patternfly/react-core';
import type { InsightsDateRange } from '@/features/insights/insightsRange';
import { isInsightsDateRangeActive, isValidInsightsDateRange } from '@/features/insights/insightsRange';
import { NativeInput } from '@/ui/forms/NativeInput';

type Props = {
  range: InsightsDateRange;
  onChange: (range: InsightsDateRange) => void;
};

export function InsightsDateFilter({ range, onChange }: Props) {
  const rangeError = isValidInsightsDateRange(range)
    ? undefined
    : 'End date must be on or after start date.';

  return (
    <div className="rs-insights-filter">
      <div className="rs-form-row">
        <NativeInput
          id="insights-start-date"
          label="Start date"
          type="date"
          value={range.startDate ?? ''}
          onChange={(startDate) =>
            onChange({ ...range, startDate: startDate || undefined })
          }
        />
        <NativeInput
          id="insights-end-date"
          label="End date"
          type="date"
          value={range.endDate ?? ''}
          onChange={(endDate) =>
            onChange({ ...range, endDate: endDate || undefined })
          }
          validated={rangeError ? 'error' : 'default'}
          error={rangeError}
          isLast
        />
      </div>
      {isInsightsDateRangeActive(range) ? (
        <div className="rs-insights-filter__actions">
          <Button
            variant="link"
            isInline
            onClick={() => onChange({})}
          >
            Clear dates
          </Button>
        </div>
      ) : null}
    </div>
  );
}
