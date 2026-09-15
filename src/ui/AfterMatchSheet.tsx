import { useMemo, useState } from 'react';
import { Button, FormGroup, TextInput } from '@patternfly/react-core';
import type { Expense, Match, PaymentMethod } from '@/domain/match';
import { formatCurrency } from '@/domain/matchDisplay';
import { formatExpenseCategory } from '@/domain/expenseCategories';
import { useMatchesContext } from '@/features/matches/MatchesProvider';
import {
  getTravelCostEntries,
  markTravelReimbursed,
  suggestExpensesFromTravel,
  type TravelCostSource,
} from '@/features/matches/travelFinance';
import { ExpenseSheet } from '@/ui/forms/ExpenseSheet';

type Props = {
  match: Match;
  onClose: () => void;
};

type Step =
  | 'start'
  | 'removed'
  | 'cancelled'
  | 'donated'
  | 'payment'
  | 'reimbursement'
  | 'expenses'
  | 'done';

export function AfterMatchSheet({ match, onClose }: Props) {
  const { updateMatch } = useMatchesContext();
  const [step, setStep] = useState<Step>('start');
  const [paidAmount, setPaidAmount] = useState(
    match.paidAmount != null
      ? String(match.paidAmount)
      : match.expectedPay != null
        ? String(match.expectedPay)
        : '',
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>(
    match.paymentMethod ?? '',
  );
  const [expenses, setExpenses] = useState<Expense[]>(match.expenses ?? []);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showExpenseSheet, setShowExpenseSheet] = useState(false);
  const [payOwedBy, setPayOwedBy] = useState(match.payOwedBy ?? '');
  const [liveMatch, setLiveMatch] = useState(match);

  const unreimbursedTravel = useMemo(
    () =>
      getTravelCostEntries(liveMatch).filter(
        (entry) => entry.reimbursementStatus !== 'reimbursed',
      ),
    [liveMatch],
  );

  const travelSuggestions = useMemo(
    () => suggestExpensesFromTravel(liveMatch, expenses),
    [liveMatch, expenses],
  );

  const goToPostStatusFlow = () => {
    setStep('expenses');
  };

  const saveStatus = (patch: Partial<Match>) => {
    updateMatch(match.id, patch);
    setLiveMatch((current) => ({ ...current, ...patch }));
  };

  const finishCompleted = (patch: Partial<Match>) => {
    saveStatus({ ...patch, status: 'completed' });
    goToPostStatusFlow();
  };

  const markCancelled = (payStillExpected: boolean) => {
    const patch: Partial<Match> = {
      status: 'cancelled',
      payStatus: payStillExpected ? 'unpaid' : 'not_tracked',
    };
    const nextMatch = { ...liveMatch, ...patch };
    saveStatus(patch);

    const hasTravelCosts = getTravelCostEntries(nextMatch).length > 0;
    if (hasTravelCosts || expenses.length > 0) {
      goToPostStatusFlow();
      return;
    }

    onClose();
  };

  const markReimbursed = (source: TravelCostSource) => {
    const patch = markTravelReimbursed(liveMatch, source);
    if (Object.keys(patch).length === 0) return;
    saveStatus(patch);
  };

  const importTravelExpenses = () => {
    setExpenses((current) => [...current, ...travelSuggestions]);
  };

  const saveExpensesAndClose = () => {
    updateMatch(match.id, {
      expenses: expenses.length > 0 ? expenses : undefined,
    });
    onClose();
  };

  if (showExpenseSheet) {
    return (
      <ExpenseSheet
        expense={editingExpense}
        onClose={() => {
          setShowExpenseSheet(false);
          setEditingExpense(null);
        }}
        onSave={(expense) => {
          setExpenses((current) => {
            const exists = current.some((item) => item.id === expense.id);
            if (exists) {
              return current.map((item) =>
                item.id === expense.id ? expense : item,
              );
            }
            return [...current, expense];
          });
          setShowExpenseSheet(false);
          setEditingExpense(null);
        }}
        onDelete={
          editingExpense
            ? () => {
                setExpenses((current) =>
                  current.filter((item) => item.id !== editingExpense.id),
                );
                setShowExpenseSheet(false);
                setEditingExpense(null);
              }
            : undefined
        }
      />
    );
  }

  return (
    <div className="rs-modal-backdrop" onClick={onClose}>
      <div
        className="rs-modal rs-modal--sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="after-match-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="rs-modal__header">
          <h2 id="after-match-title" className="rs-modal__title">
            After Match
          </h2>
          <button
            type="button"
            className="rs-modal__close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="rs-modal__body rs-form-stack rs-form-stack--compact">
          {step === 'start' && (
            <>
              <p className="rs-form-hint">How did this assignment end?</p>
              <Button variant="primary" isBlock onClick={() => setStep('donated')}>
                Completed as scheduled
              </Button>
              <Button variant="secondary" isBlock onClick={() => setStep('cancelled')}>
                Match was cancelled
              </Button>
              <Button variant="secondary" isBlock onClick={() => setStep('removed')}>
                I was removed from the assignment
              </Button>
            </>
          )}

          {step === 'removed' && (
            <>
              <p className="rs-form-hint">Is match payment still expected?</p>
              <Button variant="primary" isBlock onClick={() => markCancelled(true)}>
                Yes, still expect pay
              </Button>
              <Button variant="secondary" isBlock onClick={() => markCancelled(false)}>
                No payment expected
              </Button>
            </>
          )}

          {step === 'cancelled' && (
            <>
              <p className="rs-form-hint">Is payment still expected?</p>
              <Button variant="primary" isBlock onClick={() => markCancelled(true)}>
                Yes, still expect pay
              </Button>
              <Button variant="secondary" isBlock onClick={() => markCancelled(false)}>
                No payment expected
              </Button>
            </>
          )}

          {step === 'donated' && (
            <>
              <p className="rs-form-hint">Was this a donated or free assignment?</p>
              <Button
                variant="primary"
                isBlock
                onClick={() =>
                  finishCompleted({
                    payStatus: 'donated',
                    paidAmount: 0,
                  })
                }
              >
                Yes, donated / free
              </Button>
              <Button variant="secondary" isBlock onClick={() => setStep('payment')}>
                No, track payment
              </Button>
            </>
          )}

          {step === 'payment' && (
            <>
              <FormGroup label="Amount received" fieldId="after-paid-amount">
                <TextInput
                  id="after-paid-amount"
                  type="number"
                  inputMode="decimal"
                  value={paidAmount}
                  onChange={(_event, value) => setPaidAmount(value)}
                />
              </FormGroup>
              <FormGroup label="Method" fieldId="after-payment-method">
                <select
                  id="after-payment-method"
                  className="rs-select"
                  value={paymentMethod}
                  onChange={(event) =>
                    setPaymentMethod(event.target.value as PaymentMethod | '')
                  }
                >
                  <option value="">Not specified</option>
                  <option value="cash">Cash</option>
                  <option value="electronic">Electronic</option>
                  <option value="other">Other</option>
                </select>
              </FormGroup>
              <Button
                variant="primary"
                isBlock
                onClick={() => {
                  const amount = Number(paidAmount);
                  finishCompleted({
                    payStatus: 'paid',
                    paidAmount: Number.isFinite(amount) ? amount : undefined,
                    paidAt: new Date(),
                    paymentMethod: paymentMethod || undefined,
                  });
                }}
              >
                Mark paid
              </Button>
              <FormGroup label="Who owes pay?" fieldId="after-pay-owed-by">
                <TextInput
                  id="after-pay-owed-by"
                  value={payOwedBy}
                  placeholder="Assigner, union, club…"
                  onChange={(_event, value) => setPayOwedBy(value)}
                />
              </FormGroup>
              <Button
                variant="secondary"
                isBlock
                onClick={() =>
                  finishCompleted({
                    payStatus: 'unpaid',
                    payOwedBy: payOwedBy.trim() || undefined,
                  })
                }
              >
                Not paid yet
              </Button>
            </>
          )}

          {step === 'reimbursement' && (
            <>
              <p className="rs-form-hint">
                Have you received reimbursement for these travel costs?
              </p>
              {unreimbursedTravel.length > 0 ? (
                <ul className="rs-expense-list">
                  {unreimbursedTravel.map((entry) => (
                    <li key={entry.source} className="rs-expense-row">
                      <span>
                        {entry.label}: {formatCurrency(entry.amount)}
                      </span>
                      <Button
                        variant="link"
                        onClick={() => markReimbursed(entry.source)}
                      >
                        Mark reimbursed
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rs-form-hint">No travel costs to review.</p>
              )}
              <Button variant="primary" isBlock onClick={() => setStep('expenses')}>
                Continue to expenses
              </Button>
            </>
          )}

          {step === 'expenses' && (
            <>
              <p className="rs-form-hint">
                Review expenses for this match. Travel costs you marked as self-paid
                can be added here too.
              </p>

              {travelSuggestions.length > 0 && (
                <Button variant="secondary" isBlock onClick={importTravelExpenses}>
                  Add from travel (
                  {formatCurrency(
                    travelSuggestions.reduce((sum, item) => sum + item.amount, 0),
                  )}
                  )
                </Button>
              )}

              {expenses.length > 0 ? (
                <ul className="rs-expense-list">
                  {expenses.map((expense) => (
                    <li key={expense.id} className="rs-expense-row">
                      <span className="rs-expense-row__summary">
                        <span>{formatExpenseCategory(expense.category)}</span>
                        <span>{formatCurrency(expense.amount)}</span>
                      </span>
                      <Button
                        variant="link"
                        onClick={() => {
                          setEditingExpense(expense);
                          setShowExpenseSheet(true);
                        }}
                      >
                        Edit
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rs-form-hint">No expenses added yet.</p>
              )}

              <Button
                variant="secondary"
                isBlock
                onClick={() => {
                  setEditingExpense(null);
                  setShowExpenseSheet(true);
                }}
              >
                Add expense
              </Button>
              <Button variant="primary" isBlock onClick={saveExpensesAndClose}>
                Done
              </Button>
            </>
          )}

          {step === 'done' && (
            <>
              <p className="rs-form-hint">Match saved.</p>
              <Button variant="primary" isBlock onClick={() => setStep('expenses')}>
                Review expenses
              </Button>
              <Button variant="secondary" isBlock onClick={onClose}>
                Close
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
