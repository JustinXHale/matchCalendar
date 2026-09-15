import { FormGroup, TextInput } from '@patternfly/react-core';
import type { TravelSelfPaidInfo } from '@/domain/match';
import { REIMBURSEMENT_STATUS_LABELS } from '@/domain/reimbursement';
import { DateTimeInput } from '@/ui/forms/DateTimeInput';
import { NativeInput } from '@/ui/forms/NativeInput';

type Props = {
  idPrefix: string;
  values: TravelSelfPaidInfo;
  onChange: (patch: Partial<TravelSelfPaidInfo>) => void;
};

function clearSelfPaidFields(): Partial<TravelSelfPaidInfo> {
  return {
    selfPaid: false,
    amountPaid: undefined,
    reimbursementStatus: undefined,
    reimbursedAmount: undefined,
    reimbursedAt: undefined,
  };
}

export function TravelPaidFields({ idPrefix, values, onChange }: Props) {
  const {
    selfPaid,
    amountPaid,
    reimbursementStatus = 'not_expected',
    reimbursedAmount,
    reimbursedAt,
  } = values;

  return (
    <div className="rs-travel-paid">
      <label className="rs-check-label" htmlFor={`${idPrefix}-self-paid`}>
        <input
          id={`${idPrefix}-self-paid`}
          type="checkbox"
          checked={Boolean(selfPaid)}
          onChange={(event) => {
            if (!event.target.checked) {
              onChange(clearSelfPaidFields());
              return;
            }

            onChange({
              selfPaid: true,
              reimbursementStatus: reimbursementStatus ?? 'not_expected',
            });
          }}
        />
        I paid
      </label>

      {selfPaid ? (
        <div className="rs-travel-paid__details">
          <div className="rs-form-row">
            <NativeInput
              id={`${idPrefix}-amount-paid`}
              label="Amount"
              type="number"
              inputMode="decimal"
              value={amountPaid != null ? String(amountPaid) : ''}
              onChange={(value) => {
                const trimmed = value.trim();
                onChange({
                  amountPaid: trimmed ? Number(trimmed) : undefined,
                });
              }}
            />

            <FormGroup
              label="Reimbursement"
              fieldId={`${idPrefix}-reimbursement`}
            >
              <select
                id={`${idPrefix}-reimbursement`}
                className="rs-select"
                value={reimbursementStatus}
                onChange={(event) => {
                  const nextStatus = event.target
                    .value as keyof typeof REIMBURSEMENT_STATUS_LABELS;
                  onChange({
                    reimbursementStatus: nextStatus,
                    reimbursedAmount:
                      nextStatus === 'reimbursed'
                        ? reimbursedAmount ?? amountPaid
                        : undefined,
                    reimbursedAt:
                      nextStatus === 'reimbursed'
                        ? reimbursedAt ?? new Date()
                        : undefined,
                  });
                }}
              >
                {Object.entries(REIMBURSEMENT_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </FormGroup>
          </div>

          {reimbursementStatus === 'reimbursed' ? (
            <div className="rs-form-row">
              <FormGroup
                label="Reimbursed amount"
                fieldId={`${idPrefix}-reimbursed-amount`}
              >
                <TextInput
                  id={`${idPrefix}-reimbursed-amount`}
                  type="number"
                  inputMode="decimal"
                  value={
                    reimbursedAmount != null ? String(reimbursedAmount) : ''
                  }
                  onChange={(_event, value) =>
                    onChange({
                      reimbursedAmount: value.trim()
                        ? Number(value)
                        : undefined,
                    })
                  }
                />
              </FormGroup>
              <DateTimeInput
                id={`${idPrefix}-reimbursed-at`}
                label="Reimbursed date" dateOnly
                value={reimbursedAt}
                onChange={(date) => onChange({ reimbursedAt: date })}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
