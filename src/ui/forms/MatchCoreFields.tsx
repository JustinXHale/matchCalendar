import { FormGroup, TextInput } from '@patternfly/react-core';
import type { MatchTypePreset } from '@/domain/match';
import type { MatchFormErrors, MatchFormValues } from '@/features/matches/matchValidation';
import { DateTimeInput } from '@/ui/forms/DateTimeInput';
import { fromDateTimeInputValue, toDateTimeInputValue } from '@/ui/forms/formDateUtils';
import { NativeInput } from '@/ui/forms/NativeInput';
import type { TournamentPayScope } from '@/domain/tournament';
import { PresetSelectFields } from '@/ui/forms/PresetSelectFields';
import { TournamentPayScopeField } from '@/ui/forms/TournamentPayScopeField';

type Props = {
  values: MatchFormValues;
  errors: MatchFormErrors;
  onChange: (patch: Partial<MatchFormValues>) => void;
  showPayFields?: boolean;
  showStatus?: boolean;
  tournament?: boolean;
  tournamentContainer?: boolean;
  tournamentPayScope?: TournamentPayScope;
  tournamentChild?: boolean;
  inheritedLocation?: string;
  inheritedExpectedPay?: string;
  onExitTournamentContainer?: (matchType: MatchTypePreset) => void;
  tournamentStartDate?: string;
  tournamentEndDate?: string;
  onTournamentDatesChange?: (patch: {
    startDate?: string;
    endDate?: string;
  }) => void;
  onPayScopeChange?: (payScope: TournamentPayScope) => void;
};

export function MatchCoreFields({
  values,
  errors,
  onChange,
  showPayFields = false,
  showStatus = false,
  tournament = false,
  tournamentContainer = false,
  tournamentPayScope = 'tournament',
  tournamentChild = false,
  inheritedLocation,
  inheritedExpectedPay,
  onExitTournamentContainer,
  tournamentStartDate = '',
  tournamentEndDate = '',
  onTournamentDatesChange,
  onPayScopeChange,
}: Props) {
  if (tournamentChild) {
    return (
      <div className="rs-form-stack rs-form-stack--compact">
        <NativeInput
          id="match-datetime"
          label="Date and time"
          type="datetime-local"
          isRequired
          value={values.date && values.time ? `${values.date}T${values.time}` : ''}
          onChange={(value) => {
            const [date = '', time = ''] = value.split('T');
            onChange({ date, time });
          }}
          validated={errors.date || errors.time ? 'error' : 'default'}
          error={errors.date || errors.time}
        />

        <FormGroup label="Event title" fieldId="match-title">
          <TextInput
            id="match-title"
            value={values.title}
            onChange={(_event, value) => onChange({ title: value })}
          />
        </FormGroup>

        <div className="rs-form-row">
          <FormGroup label="Home" fieldId="match-home">
            <TextInput
              id="match-home"
              value={values.home}
              onChange={(_event, value) => onChange({ home: value })}
            />
          </FormGroup>

          <FormGroup label="Away" fieldId="match-away">
            <TextInput
              id="match-away"
              value={values.away}
              onChange={(_event, value) => onChange({ away: value })}
            />
          </FormGroup>
        </div>

        {errors.teams ? (
          <span className="rs-form-error" role="alert">{errors.teams}</span>
        ) : null}

        {inheritedLocation ? (
          <p className="rs-form-hint">Location: {inheritedLocation}</p>
        ) : null}

        <PresetSelectFields
          positionPreset={values.positionPreset}
          customPosition={values.customPosition}
          matchType={values.matchType}
          customMatchType={values.customMatchType}
          positionError={errors.position}
          matchTypeError={errors.customMatchType ?? errors.matchType}
          onChange={onChange}
        />

        {inheritedLocation && inheritedExpectedPay === undefined ? (
          <p className="rs-form-hint">
            Pay is tracked on the tournament, not per game.
          </p>
        ) : (
          <FormGroup label="Expected pay" fieldId="match-expected-pay">
            <TextInput
              id="match-expected-pay"
              type="number"
              inputMode="decimal"
              value={values.expectedPay}
              onChange={(_event, value) => onChange({ expectedPay: value })}
              validated={errors.expectedPay ? 'error' : 'default'}
            />
            {inheritedExpectedPay ? (
              <p className="rs-form-hint">
                Pre-filled from tournament default. Change only if this game pays differently.
              </p>
            ) : (
              <p className="rs-form-hint">
                Optional. Leave blank if pay is not tracked for this game.
              </p>
            )}
            {errors.expectedPay ? (
              <span className="rs-form-error" role="alert">{errors.expectedPay}</span>
            ) : null}
          </FormGroup>
        )}
      </div>
    );
  }

  return (
    <div className="rs-form-stack rs-form-stack--compact">
      {!tournament && (
        <NativeInput
          id="match-datetime"
          label="Date and time"
          type="datetime-local"
          isRequired
          value={values.date && values.time ? `${values.date}T${values.time}` : ''}
          onChange={(value) => {
            const [date = '', time = ''] = value.split('T');
            onChange({ date, time });
          }}
          validated={errors.date || errors.time ? 'error' : 'default'}
          error={errors.date || errors.time}
        />
      )}

      <FormGroup label="Event title" fieldId="match-title">
        <TextInput
          id="match-title"
          value={values.title}
          onChange={(_event, value) => onChange({ title: value })}
        />
      </FormGroup>

      {!tournament && (
        <div className="rs-form-row">
          <FormGroup label="Home" fieldId="match-home">
            <TextInput
              id="match-home"
              value={values.home}
              onChange={(_event, value) => onChange({ home: value })}
            />
          </FormGroup>

          <FormGroup label="Away" fieldId="match-away">
            <TextInput
              id="match-away"
              value={values.away}
              onChange={(_event, value) => onChange({ away: value })}
            />
          </FormGroup>
        </div>
      )}

      {errors.teams ? (
        <span className="rs-form-error" role="alert">{errors.teams}</span>
      ) : null}

      <FormGroup label="Location" isRequired fieldId="match-location">
        <TextInput
          id="match-location"
          value={values.location}
          onChange={(_event, value) => onChange({ location: value })}
          validated={errors.location ? 'error' : 'default'}
        />
        {errors.location ? (
          <span className="rs-form-error" role="alert">{errors.location}</span>
        ) : null}
      </FormGroup>

      <PresetSelectFields
        positionPreset={values.positionPreset}
        customPosition={values.customPosition}
        matchType={tournamentContainer ? 'tournament' : values.matchType}
        customMatchType={tournamentContainer ? '' : values.customMatchType}
        gameFormat={tournamentContainer ? values.matchType : undefined}
        customGameFormat={tournamentContainer ? values.customMatchType : undefined}
        positionError={errors.position}
        matchTypeError={errors.customMatchType ?? errors.matchType}
        onChange={(patch) => {
          if (
            tournamentContainer &&
            patch.matchType &&
            patch.matchType !== 'tournament'
          ) {
            onExitTournamentContainer?.(patch.matchType);
            return;
          }
          onChange(patch);
        }}
        onGameFormatChange={
          tournamentContainer
            ? ({ gameFormat, customGameFormat }) =>
                onChange({
                  ...(gameFormat != null ? { matchType: gameFormat } : {}),
                  ...(customGameFormat != null
                    ? { customMatchType: customGameFormat }
                    : {}),
                })
            : undefined
        }
      />

      {tournamentContainer ? (
        <div className="rs-form-row">
          <NativeInput
            id="tournament-start"
            label="Start date"
            type="date"
            isRequired
            value={tournamentStartDate}
            onChange={(startDate) =>
              onTournamentDatesChange?.({ startDate })
            }
          />
          <NativeInput
            id="tournament-end"
            label="End date"
            type="date"
            isRequired
            value={tournamentEndDate}
            onChange={(endDate) =>
              onTournamentDatesChange?.({ endDate })
            }
          />
        </div>
      ) : null}

      {showPayFields ? (
        <>
          <FormGroup label="Competition" fieldId="match-competition">
            <TextInput
              id="match-competition"
              value={values.competition}
              onChange={(_event, value) => onChange({ competition: value })}
            />
          </FormGroup>

          {tournamentContainer && onPayScopeChange ? (
            <>
              <div className="rs-form-row">
                <TournamentPayScopeField
                  inline
                  value={tournamentPayScope}
                  onChange={onPayScopeChange}
                />
                <FormGroup
                  label={
                    tournamentPayScope === 'per_match'
                      ? 'Default expected pay per game'
                      : 'Expected pay for tournament'
                  }
                  fieldId="match-expected-pay"
                >
                  <TextInput
                    id="match-expected-pay"
                    type="number"
                    inputMode="decimal"
                    value={values.expectedPay}
                    onChange={(_event, value) => onChange({ expectedPay: value })}
                    validated={errors.expectedPay ? 'error' : 'default'}
                  />
                  {errors.expectedPay ? (
                    <span className="rs-form-error" role="alert">{errors.expectedPay}</span>
                  ) : null}
                </FormGroup>
              </div>
              <p className="rs-form-hint">
                {tournamentPayScope === 'tournament'
                  ? 'Track pay once on the tournament. Individual games will not expect separate fees.'
                  : 'Each game can track its own pay. The amount above pre-fills new games.'}
              </p>
              <FormGroup label="Pay status" fieldId="match-pay-status">
                <select
                  id="match-pay-status"
                  className="rs-select"
                  value={values.payStatus}
                  onChange={(event) =>
                    onChange({
                      payStatus: event.target.value as MatchFormValues['payStatus'],
                    })
                  }
                >
                  <option value="not_tracked">Not tracked</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="donated">Donated / free</option>
                </select>
              </FormGroup>
            </>
          ) : (
            <div className="rs-form-row rs-form-row--3">
              <FormGroup label="Expected pay" fieldId="match-expected-pay">
                <TextInput
                  id="match-expected-pay"
                  type="number"
                  inputMode="decimal"
                  value={values.expectedPay}
                  onChange={(_event, value) => onChange({ expectedPay: value })}
                  validated={errors.expectedPay ? 'error' : 'default'}
                />
                {errors.expectedPay ? (
                  <span className="rs-form-error" role="alert">{errors.expectedPay}</span>
                ) : null}
              </FormGroup>

              <FormGroup label="Pay status" fieldId="match-pay-status">
                <select
                  id="match-pay-status"
                  className="rs-select"
                  value={values.payStatus}
                  onChange={(event) =>
                    onChange({
                      payStatus: event.target.value as MatchFormValues['payStatus'],
                    })
                  }
                >
                  <option value="not_tracked">Not tracked</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="donated">Donated / free</option>
                </select>
              </FormGroup>

              <FormGroup label="Who owes pay?" fieldId="match-pay-owed-by">
                <TextInput
                  id="match-pay-owed-by"
                  value={values.payOwedBy}
                  placeholder="Assigner, union, club…"
                  onChange={(_event, value) => onChange({ payOwedBy: value })}
                />
              </FormGroup>
            </div>
          )}

          {values.payStatus === 'paid' ? (
            <div className="rs-form-row">
              <FormGroup label="Paid amount" fieldId="match-paid-amount">
                <TextInput
                  id="match-paid-amount"
                  type="number"
                  inputMode="decimal"
                  value={values.paidAmount}
                  onChange={(_event, value) => onChange({ paidAmount: value })}
                  validated={errors.paidAmount ? 'error' : 'default'}
                />
                {errors.paidAmount ? (
                  <span className="rs-form-error" role="alert">{errors.paidAmount}</span>
                ) : null}
              </FormGroup>

              <DateTimeInput
                id="match-paid-at"
                label="Paid date"
                dateOnly
                value={
                  values.paidAt
                    ? fromDateTimeInputValue(values.paidAt)
                    : undefined
                }
                onChange={(date) =>
                  onChange({
                    paidAt: date ? toDateTimeInputValue(date) : '',
                  })
                }
              />
            </div>
          ) : null}

          {values.payStatus === 'paid' ? (
            <FormGroup label="Method" fieldId="match-payment-method">
              <select
                id="match-payment-method"
                className="rs-select"
                value={values.paymentMethod}
                onChange={(event) =>
                  onChange({
                    paymentMethod: event.target.value as MatchFormValues['paymentMethod'],
                  })
                }
              >
                <option value="">Not specified</option>
                <option value="cash">Cash</option>
                <option value="electronic">Electronic</option>
                <option value="other">Other</option>
              </select>
            </FormGroup>
          ) : null}

          {showStatus ? (
            <FormGroup label="Status" fieldId="match-status">
              <select
                id="match-status"
                className="rs-select"
                value={values.status}
                onChange={(event) =>
                  onChange({
                    status: event.target.value as MatchFormValues['status'],
                  })
                }
              >
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </FormGroup>
          ) : null}

          {tournamentContainer ? (
            <div className="rs-form-row">
              <FormGroup label="Who owes pay?" fieldId="match-pay-owed-by">
                <TextInput
                  id="match-pay-owed-by"
                  value={values.payOwedBy}
                  placeholder="Assigner, union, club…"
                  onChange={(_event, value) => onChange({ payOwedBy: value })}
                />
              </FormGroup>

              <FormGroup label="Uniform" fieldId="match-uniform">
                <TextInput
                  id="match-uniform"
                  value={values.uniform}
                  onChange={(_event, value) => onChange({ uniform: value })}
                />
              </FormGroup>
            </div>
          ) : (
            <FormGroup label="Uniform" fieldId="match-uniform">
              <TextInput
                id="match-uniform"
                value={values.uniform}
                onChange={(_event, value) => onChange({ uniform: value })}
              />
            </FormGroup>
          )}

          <FormGroup label="Notes" fieldId="match-notes">
            <TextInput
              id="match-notes"
              value={values.notes}
              onChange={(_event, value) => onChange({ notes: value })}
            />
          </FormGroup>
        </>
      ) : (
        <FormGroup label="Expected pay (optional)" fieldId="match-expected-pay">
          <TextInput
            id="match-expected-pay"
            type="number"
            inputMode="decimal"
            value={values.expectedPay}
            onChange={(_event, value) => onChange({ expectedPay: value })}
            validated={errors.expectedPay ? 'error' : 'default'}
          />
          {errors.expectedPay ? (
            <span className="rs-form-error" role="alert">{errors.expectedPay}</span>
          ) : null}
        </FormGroup>
      )}
    </div>
  );
}
