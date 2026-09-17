import { useEffect, useMemo, useState } from 'react';
import { Button, FormGroup } from '@patternfly/react-core';
import { FormTextInput } from '@/ui/forms/FormTextInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faUser, faXmark } from '@fortawesome/free-solid-svg-icons';
import type { Expense, Match, PaymentMethod, ReimbursementStatus } from '@/domain/match';
import {
  parsePaymentMethodDetail,
  PAYMENT_SERVICE_PRESETS,
  serializePaymentMethodDetail,
  type PaymentServicePreset,
} from '@/domain/paymentMethod';
import { formatCurrency } from '@/domain/matchDisplay';
import { formatExpenseCategory } from '@/domain/expenseCategories';
import {
  getOpenSettlementLabels,
  getSettlementSummaryLabel,
  markExpenseNotExpected,
  markExpensePending,
  markExpenseReimbursed,
  needsMatchClosure,
  needsSettlementAttention,
  payLineChoiceFromMatch,
  updateExpenseAmount,
  type PayLineChoice,
} from '@/features/matches/matchClosure';
import { useMatchesContext } from '@/features/matches/MatchesProvider';
import {
  getTravelCostEntries,
  markTravelNotExpected,
  markTravelPending,
  markTravelReimbursed,
  travelCostAlreadyInExpenses,
  updateTravelAmountPaid,
  type TravelCostSource,
} from '@/features/matches/travelFinance';
import { getMatchFinanceTotals, getSettlementPaidTotal } from '@/features/matches/paySummary';
import { DateTimeInput } from '@/ui/forms/DateTimeInput';
import {
  fromDateTimeInputValue,
  toDateTimeInputValue,
} from '@/ui/forms/formDateUtils';
import { ExpenseSheet } from '@/ui/forms/ExpenseSheet';

type Props = {
  match: Match;
  defaultExpanded?: boolean;
  onSavePatch?: (patch: Partial<Match>) => void;
};

type Draft = {
  feeAmount: string;
  payChoice: PayLineChoice;
  payOwedBy: string;
  paidAt: string;
  paymentMethod: PaymentMethod | '';
  paymentServicePreset: PaymentServicePreset | '';
  paymentServiceCustom: string;
};

function createDraft(match: Match): Draft {
  const { preset, custom } = parsePaymentMethodDetail(match.paymentMethodDetail);

  return {
    feeAmount:
      match.paidAmount != null
        ? String(match.paidAmount)
        : match.expectedPay != null
          ? String(match.expectedPay)
          : '',
    payChoice: payLineChoiceFromMatch(match),
    payOwedBy: match.payOwedBy ?? '',
    paidAt: match.paidAt
      ? toDateTimeInputValue(match.paidAt)
      : toDateTimeInputValue(new Date()),
    paymentMethod: match.paymentMethod ?? '',
    paymentServicePreset: preset,
    paymentServiceCustom: custom,
  };
}

function paymentDetailFromDraft(draft: Draft): string | undefined {
  if (draft.paymentMethod !== 'electronic' && draft.paymentMethod !== 'other') {
    return undefined;
  }
  return serializePaymentMethodDetail(
    draft.paymentServicePreset,
    draft.paymentServiceCustom,
  );
}

function mergePatch(current: Match, patch: Partial<Match>): Match {
  return { ...current, ...patch };
}

type SettlementChoice = 'settled' | 'waiting' | 'self';

function reimbursementToChoice(status: ReimbursementStatus): SettlementChoice {
  if (status === 'reimbursed') return 'settled';
  if (status === 'pending') return 'waiting';
  return 'self';
}

type SettlementTogglesProps = {
  choice: SettlementChoice;
  onChange: (choice: SettlementChoice) => void;
  showSelf?: boolean;
  settledLabel: string;
  waitingLabel: string;
  selfLabel: string;
};

function SettlementToggles({
  choice,
  onChange,
  showSelf = true,
  settledLabel,
  waitingLabel,
  selfLabel,
}: SettlementTogglesProps) {
  return (
    <div className="rs-settlement-line__actions">
      <button
        type="button"
        className={[
          'rs-settlement-line__btn',
          'rs-settlement-line__btn--yes',
          choice === 'settled' ? 'is-active' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label={settledLabel}
        aria-pressed={choice === 'settled'}
        onClick={() => onChange('settled')}
      >
        <FontAwesomeIcon icon={faCheck} aria-hidden />
      </button>
      <button
        type="button"
        className={[
          'rs-settlement-line__btn',
          'rs-settlement-line__btn--no',
          choice === 'waiting' ? 'is-active' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label={waitingLabel}
        aria-pressed={choice === 'waiting'}
        onClick={() => onChange('waiting')}
      >
        <FontAwesomeIcon icon={faXmark} aria-hidden />
      </button>
      {showSelf ? (
        <button
          type="button"
          className={[
            'rs-settlement-line__btn',
            'rs-settlement-line__btn--self',
            choice === 'self' ? 'is-active' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-label={selfLabel}
          aria-pressed={choice === 'self'}
          onClick={() => onChange('self')}
        >
          <FontAwesomeIcon icon={faUser} aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

function payChoiceToSettlement(choice: PayLineChoice): SettlementChoice {
  if (choice === 'paid') return 'settled';
  if (choice === 'donated') return 'self';
  if (choice === 'unpaid') return 'waiting';
  return 'waiting';
}

export function MatchMoneyClosure({ match, defaultExpanded = false, onSavePatch }: Props) {
  const { updateMatch } = useMatchesContext();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [draft, setDraft] = useState(() => createDraft(match));
  const [liveMatch, setLiveMatch] = useState(match);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showExpenseSheet, setShowExpenseSheet] = useState(false);

  useEffect(() => {
    setLiveMatch(match);
  }, [match]);

  const travelEntries = useMemo(
    () => getTravelCostEntries(liveMatch),
    [liveMatch],
  );
  const expenses = liveMatch.expenses ?? [];
  const previewAmount = Number(draft.feeAmount);
  const previewMatch: Match = {
    ...liveMatch,
    payStatus: draft.payChoice === 'unset' ? 'not_tracked' : draft.payChoice,
    paidAmount: draft.feeAmount.trim() && Number.isFinite(previewAmount) ? previewAmount : undefined,
  };
  const openLabels = getOpenSettlementLabels(previewMatch);
  const needsAttention = needsSettlementAttention(previewMatch);
  const finance = getMatchFinanceTotals(previewMatch);
  const paid = getSettlementPaidTotal(previewMatch);
  const panelLabel = `${getSettlementSummaryLabel(previewMatch).split(' · ')[0]} · Paid ${formatCurrency(paid, liveMatch.payCurrency)} · Expenses ${formatCurrency(finance.combinedExpenseTotal, liveMatch.payCurrency)} · Net ${formatCurrency(paid - finance.combinedExpenseTotal, liveMatch.payCurrency)}`;

  const applyPatch = (patch: Partial<Match>) => {
    if (onSavePatch) onSavePatch(patch);
    else updateMatch(match.id, patch);
    setLiveMatch((current) => mergePatch(current, patch));
  };

  const ensureCompleted = (): Partial<Match> => {
    if (needsMatchClosure(liveMatch)) {
      return { status: 'completed' };
    }
    return {};
  };

  const buildPayPatch = (): Partial<Match> => {
    const completion = ensureCompleted();

    if (draft.payChoice === 'donated') {
      return {
        ...completion,
        payStatus: 'donated',
        paidAmount: 0,
        paidAt: undefined,
        paymentMethod: undefined,
        paymentMethodDetail: undefined,
        payOwedBy: undefined,
      };
    }

    if (draft.payChoice === 'paid') {
      const amount = Number(draft.feeAmount);
      return {
        ...completion,
        payStatus: 'paid',
        paidAmount: Number.isFinite(amount) ? amount : undefined,
        paidAt: draft.paidAt ? new Date(draft.paidAt) : new Date(),
        paymentMethod: draft.paymentMethod || undefined,
        paymentMethodDetail: paymentDetailFromDraft(draft),
        payOwedBy: undefined,
      };
    }

    if (draft.payChoice === 'unpaid') {
      return {
        ...completion,
        payStatus: 'unpaid',
        paidAmount: undefined,
        paidAt: undefined,
        payOwedBy: draft.payOwedBy.trim() || undefined,
      };
    }

    return {
      ...completion,
      payStatus: 'not_tracked',
    };
  };

  const setPayChoice = (choice: PayLineChoice) => {
    setDraft((current) => ({ ...current, payChoice: choice }));
  };

  const applyTravelChoice = (
    source: TravelCostSource,
    choice: SettlementChoice,
  ) => {
    const patch =
      choice === 'settled'
        ? markTravelReimbursed(liveMatch, source)
        : choice === 'waiting'
          ? markTravelPending(liveMatch, source)
          : markTravelNotExpected(liveMatch, source);
    applyPatch({ ...ensureCompleted(), ...patch });
  };

  const applyExpenseChoice = (expenseId: string, choice: SettlementChoice) => {
    const patch =
      choice === 'settled'
        ? markExpenseReimbursed(liveMatch, expenseId)
        : choice === 'waiting'
          ? markExpensePending(liveMatch, expenseId)
          : markExpenseNotExpected(liveMatch, expenseId);
    applyPatch({ ...ensureCompleted(), ...patch });
  };

  const applyPayChoice = (choice: SettlementChoice) => {
    if (choice === 'settled') {
      setPayChoice('paid');
      return;
    }
    if (choice === 'self') {
      setPayChoice('donated');
      return;
    }
    setPayChoice('unpaid');
  };

  const persistPayOwedBy = () => {
    applyPatch({
      payOwedBy: draft.payOwedBy.trim() || undefined,
      ...ensureCompleted(),
    });
  };

  const saveExpenseList = (nextExpenses: Expense[]) => {
    applyPatch({
      ...ensureCompleted(),
      expenses: nextExpenses.length > 0 ? nextExpenses : undefined,
    });
  };

  const closeOut = () => {
    if (draft.payChoice === 'paid' && (!draft.feeAmount.trim() || !Number.isFinite(Number(draft.feeAmount)) || Number(draft.feeAmount) < 0)) return;
    applyPatch({
      ...buildPayPatch(),
      settlementClosed: false,
    });
    setExpanded(false);
  };

  const toggleExpanded = () => {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);
    if (nextExpanded && liveMatch.settlementClosed) {
      applyPatch({ settlementClosed: false });
    }
  };

  if (showExpenseSheet) {
    return (
      <div className="rs-money-closure">
        <ExpenseSheet
          expense={editingExpense}
          onClose={() => {
            setShowExpenseSheet(false);
            setEditingExpense(null);
          }}
          onSave={(expense) => {
            const exists = expenses.some((item) => item.id === expense.id);
            const next = exists
              ? expenses.map((item) => (item.id === expense.id ? expense : item))
              : [...expenses, expense];
            saveExpenseList(next);
            setShowExpenseSheet(false);
            setEditingExpense(null);
          }}
          onDelete={
            editingExpense
              ? () => {
                  saveExpenseList(
                    expenses.filter((item) => item.id !== editingExpense.id),
                  );
                  setShowExpenseSheet(false);
                  setEditingExpense(null);
                }
              : undefined
          }
        />
      </div>
    );
  }

  const showPayLine = true;

  return (
    <div
      className={[
        'rs-money-closure',
        needsAttention ? '' : 'rs-money-closure--settled',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        className="rs-money-closure__toggle"
        aria-expanded={expanded}
        onClick={toggleExpanded}
      >
        {panelLabel}
      </button>

      {expanded && (
        <div className="rs-money-closure__panel">
          {needsMatchClosure(liveMatch) && (
            <p className="rs-settlement-note">
              This match will be marked complete when you save.
            </p>
          )}

          <FormGroup label="Who owes pay?" fieldId={`settlement-owed-${match.id}`}>
            <FormTextInput
              id={`settlement-owed-${match.id}`}
              value={draft.payOwedBy}
              placeholder="Assigner, union, club…"
              onChange={(_event, value) =>
                setDraft((current) => ({ ...current, payOwedBy: value }))
              }
              onBlur={persistPayOwedBy}
            />
          </FormGroup>

          <div className="rs-settlement-table">
            <div className="rs-settlement-header rs-settlement-grid">
              <span>Item</span>
              <span className="rs-settlement-header__amount">Amount</span>
              <span className="rs-settlement-header__status">Settled</span>
            </div>

            <ul className="rs-settlement-lines" aria-label="Settlement items">
            {showPayLine && (
              <li className="rs-settlement-line rs-settlement-grid">
                <div className="rs-settlement-line__info">
                  <span className="rs-settlement-line__label">Match fee</span>
                  {liveMatch.expectedPay != null && (
                    <span className="rs-settlement-line__hint">
                      Expected {formatCurrency(liveMatch.expectedPay, liveMatch.payCurrency)}
                    </span>
                  )}
                </div>
                <FormTextInput
                  className="rs-settlement-line__amount"
                  type="number"
                  inputMode="decimal"
                  aria-label="Match fee amount"
                  value={draft.feeAmount}
                  onChange={(_event, value) =>
                    setDraft((current) => ({ ...current, feeAmount: value }))
                  }
                />
                <SettlementToggles
                  choice={payChoiceToSettlement(draft.payChoice)}
                  onChange={applyPayChoice}
                  settledLabel="Paid"
                  waitingLabel="Not paid yet"
                  selfLabel="Donated / free"
                />
              </li>
            )}

            {travelEntries.filter((entry) => !travelCostAlreadyInExpenses(entry, expenses)).map((entry) => (
                <li key={entry.source} className="rs-settlement-line rs-settlement-grid">
                  <div className="rs-settlement-line__info">
                    <span className="rs-settlement-line__label">
                      {entry.label} reimbursement
                    </span>
                  </div>
                  <FormTextInput
                    className="rs-settlement-line__amount"
                    type="number"
                    inputMode="decimal"
                    step="any"
                    aria-label={`${entry.label} amount`}
                    value={String(entry.amount)}
                    onChange={(_event, value) => {
                      const amount = Number(value);
                      if (!Number.isFinite(amount)) return;
                      const patch = updateTravelAmountPaid(
                        liveMatch,
                        entry.source,
                        amount,
                      );
                      setLiveMatch((current) => mergePatch(current, patch));
                    }}
                    onBlur={() => {
                      const travelEntry = getTravelCostEntries(liveMatch).find(
                        (item) => item.source === entry.source,
                      );
                      if (!travelEntry) return;
                      applyPatch({
                        ...updateTravelAmountPaid(
                          liveMatch,
                          entry.source,
                          travelEntry.amount,
                        ),
                        ...ensureCompleted(),
                      });
                    }}
                  />
                  <SettlementToggles
                    choice={reimbursementToChoice(entry.reimbursementStatus)}
                    onChange={(choice) => applyTravelChoice(entry.source, choice)}
                    settledLabel={`${entry.label} reimbursed`}
                    waitingLabel={`${entry.label} awaiting reimbursement`}
                    selfLabel={`${entry.label} self expense`}
                  />
                </li>
            ))}

            {expenses.filter((expense) => expense.miles == null).map((expense) => (
                <li key={expense.id} className="rs-settlement-line rs-settlement-grid">
                  <div className="rs-settlement-line__info">
                    <button
                      type="button"
                      className="rs-settlement-line__edit"
                      onClick={() => {
                        setEditingExpense(expense);
                        setShowExpenseSheet(true);
                      }}
                    >
                      {formatExpenseCategory(expense.category)}
                    </button>
                    {expense.note && (
                      <span className="rs-settlement-line__hint">{expense.note}</span>
                    )}
                  </div>
                  <FormTextInput
                    className="rs-settlement-line__amount"
                    type="number"
                    inputMode="decimal"
                    aria-label={`${formatExpenseCategory(expense.category)} amount`}
                    value={String(expense.amount)}
                    onChange={(_event, value) => {
                      const amount = Number(value);
                      if (!Number.isFinite(amount)) return;
                      const patch = updateExpenseAmount(liveMatch, expense.id, amount);
                      setLiveMatch((current) => mergePatch(current, patch));
                    }}
                    onBlur={() => {
                      const current = liveMatch.expenses?.find(
                        (item) => item.id === expense.id,
                      );
                      if (!current) return;
                      applyPatch({
                        ...updateExpenseAmount(liveMatch, expense.id, current.amount),
                        ...ensureCompleted(),
                      });
                    }}
                  />
                  <SettlementToggles
                    choice={reimbursementToChoice(expense.reimbursementStatus)}
                    onChange={(choice) => applyExpenseChoice(expense.id, choice)}
                    settledLabel="Reimbursed"
                    waitingLabel="Awaiting reimbursement"
                    selfLabel="Self expense"
                  />
                </li>
            ))}
            </ul>
          </div>

          {draft.payChoice === 'paid' && (
            <div className="rs-settlement-pay-meta">
              <DateTimeInput
                id={`settlement-paid-at-${match.id}`}
                label="Paid date"
                dateOnly
                value={draft.paidAt ? fromDateTimeInputValue(draft.paidAt) : undefined}
                onChange={(date) => {
                  setDraft((current) => ({
                    ...current,
                    paidAt: date ? toDateTimeInputValue(date) : '',
                  }));
                }}
              />
                <FormGroup label="Method" fieldId={`settlement-method-${match.id}`}>
                  <select
                    id={`settlement-method-${match.id}`}
                    className="rs-select"
                    value={draft.paymentMethod}
                    onChange={(event) => {
                      const method = event.target.value as PaymentMethod | '';
                      setDraft((current) => ({
                        ...current,
                        paymentMethod: method,
                        paymentServicePreset:
                          method === 'cash' ? '' : current.paymentServicePreset,
                        paymentServiceCustom:
                          method === 'cash' ? '' : current.paymentServiceCustom,
                      }));
                    }}
                    >
                    <option value="">Not specified</option>
                    <option value="cash">Cash</option>
                    <option value="electronic">Electronic</option>
                    <option value="other">Other</option>
                  </select>
                </FormGroup>

                {(draft.paymentMethod === 'electronic' ||
                  draft.paymentMethod === 'other') && (
                  <>
                    <FormGroup
                      label="Service"
                      fieldId={`settlement-service-${match.id}`}
                    >
                      <select
                        id={`settlement-service-${match.id}`}
                        className="rs-select"
                        value={draft.paymentServicePreset}
                        onChange={(event) => {
                          const preset = event.target.value as PaymentServicePreset | '';
                          setDraft((current) => ({
                            ...current,
                            paymentServicePreset: preset,
                            paymentServiceCustom:
                              preset === 'other' ? current.paymentServiceCustom : '',
                          }));
                        }}
                            >
                        <option value="">Select…</option>
                        {PAYMENT_SERVICE_PRESETS.map((preset) => (
                          <option key={preset.value} value={preset.value}>
                            {preset.label}
                          </option>
                        ))}
                      </select>
                    </FormGroup>

                    {draft.paymentServicePreset === 'other' && (
                      <FormGroup
                        className="rs-settlement-pay-meta__custom"
                        label="Service name"
                        fieldId={`settlement-service-custom-${match.id}`}
                      >
                        <FormTextInput
                          id={`settlement-service-custom-${match.id}`}
                          value={draft.paymentServiceCustom}
                          placeholder="Zelle, check, etc."
                          onChange={(_event, value) =>
                            setDraft((current) => ({
                              ...current,
                              paymentServiceCustom: value,
                            }))
                          }
                                />
                      </FormGroup>
                    )}
                  </>
                )}
            </div>
          )}

          {expenses.filter((expense) => expense.miles != null).map((expense) => (
            <button type="button" key={expense.id} className="rs-settlement-line__edit"
              onClick={() => { setEditingExpense(expense); setShowExpenseSheet(true); }}>
              {formatExpenseCategory(expense.category)}: {expense.miles} miles
            </button>
          ))}
          <div className="rs-settlement-actions">
            <Button
              variant="secondary"
              isBlock
              onClick={() => {
                setEditingExpense(null);
                setShowExpenseSheet(true);
              }}
            >
              Add other expenses/Miles driven or flown
            </Button>
          </div>

          <div className="rs-settlement-footer">
            <Button variant="primary" isBlock onClick={closeOut}
              isDisabled={draft.payChoice === 'paid' && (!draft.feeAmount.trim() || !Number.isFinite(Number(draft.feeAmount)) || Number(draft.feeAmount) < 0)}>
              Save
            </Button>
          </div>

          {openLabels.length > 0 && (
            <p className="rs-settlement-note">
              Still open: {openLabels.join(' · ')}. ✓ settled · ✗ waiting ·{' '}
              <span className="rs-settlement-note__legend">
                <FontAwesomeIcon icon={faUser} aria-hidden /> self expense
              </span>
              .
            </p>
          )}
        </div>
      )}
    </div>
  );
}
