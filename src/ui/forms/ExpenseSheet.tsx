import { useState } from 'react';
import { Button, FormGroup, TextInput } from '@patternfly/react-core';
import { DateTimeInput } from '@/ui/forms/DateTimeInput';
import { EXPENSE_CATEGORY_LABELS } from '@/domain/expenseCategories';
import { REIMBURSEMENT_STATUS_LABELS } from '@/domain/reimbursement';
import type {
  Expense,
  ExpenseCategory,
  ReimbursementStatus,
} from '@/domain/match';

type Props = {
  expense: Expense | null;
  onClose: () => void;
  onSave: (expense: Expense) => void;
  onDelete?: () => void;
};

export function ExpenseSheet({ expense, onClose, onSave, onDelete }: Props) {
  const [category, setCategory] = useState<ExpenseCategory>(
    expense?.category ?? 'gas',
  );
  const [iPaid, setIPaid] = useState(true);
  const [amount, setAmount] = useState(
    expense ? String(expense.miles ?? expense.amount) : '',
  );
  const [note, setNote] = useState(expense?.note ?? '');
  const [reimbursementStatus, setReimbursementStatus] =
    useState<ReimbursementStatus>(
      expense?.reimbursementStatus ?? 'not_expected',
    );
  const [reimbursedAmount, setReimbursedAmount] = useState(
    expense?.reimbursedAmount != null ? String(expense.reimbursedAmount) : '',
  );
  const [reimbursedAt, setReimbursedAt] = useState<Date | undefined>(
    expense?.reimbursedAt,
  );

  const isMileage = category === 'miles_driven' || category === 'miles_flown';
  const validAmount = amount.trim() !== '' && Number.isFinite(Number(amount)) && Number(amount) >= 0
    && (isMileage || reimbursementStatus !== 'reimbursed' || !reimbursedAmount.trim() || (Number.isFinite(Number(reimbursedAmount)) && Number(reimbursedAmount) >= 0));

  const save = () => {
    const parsedAmount = Number(amount);
    if ((!iPaid && !isMileage) || !validAmount) return;

    onSave({
      id: expense?.id ?? crypto.randomUUID(),
      category,
      amount: isMileage ? 0 : parsedAmount,
      miles: isMileage ? parsedAmount : undefined,
      note: note.trim() || undefined,
      reimbursementStatus: isMileage ? 'not_expected' : reimbursementStatus,
      reimbursedAmount:
        !isMileage && reimbursementStatus === 'reimbursed'
          ? reimbursedAmount.trim() ? Number(reimbursedAmount) : parsedAmount
          : undefined,
      reimbursedAt:
        !isMileage && reimbursementStatus === 'reimbursed'
          ? reimbursedAt ?? new Date()
          : undefined,
      createdAt: expense?.createdAt ?? new Date(),
    });
  };

  return (
    <div className="rs-modal-backdrop" onClick={onClose}>
      <div
        className="rs-modal rs-modal--sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="expense-sheet-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="rs-modal__header">
          <h2 id="expense-sheet-title" className="rs-modal__title">
            {expense ? 'Edit expense' : 'Add expenses/Miles driven or flown'}
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
          <div className={isMileage ? "rs-form-row" : undefined}>
          <FormGroup label="Category" fieldId="expense-category">
            <select
              id="expense-category"
              className="rs-select"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as ExpenseCategory)
              }
            >
              {Object.entries(EXPENSE_CATEGORY_LABELS).sort(([a, left], [b, right]) => a === 'other' ? 1 : b === 'other' ? -1 : left.localeCompare(right)).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </FormGroup>
          {isMileage && <FormGroup label="Total miles" fieldId="expense-miles">
            <TextInput id="expense-miles" type="number" min={0} inputMode="decimal" value={amount}
              onChange={(_event, value) => setAmount(value)} />
          </FormGroup>}
          </div>

          {!isMileage && <div className="rs-travel-paid">
            <label className="rs-check-label" htmlFor="expense-self-paid">
              <input
                id="expense-self-paid"
                type="checkbox"
                checked={iPaid}
                onChange={(event) => setIPaid(event.target.checked)}
              />
              I paid
            </label>

            {iPaid ? (
              <div className="rs-travel-paid__details">
                <div className="rs-form-row">
                  <FormGroup label="Amount" fieldId="expense-amount">
                    <TextInput
                      id="expense-amount"
                      type="number"
                      inputMode="decimal"
                      value={amount}
                      onChange={(_event, value) => setAmount(value)}
                    />
                  </FormGroup>

                  <FormGroup label="Reimbursement" fieldId="expense-reimbursement">
                    <select
                      id="expense-reimbursement"
                      className="rs-select"
                      value={reimbursementStatus}
                      onChange={(event) => {
                        const nextStatus = event.target
                          .value as ReimbursementStatus;
                        const parsedAmount = Number(amount);
                        setReimbursementStatus(nextStatus);
                        if (nextStatus === 'reimbursed') {
                          if (!reimbursedAmount && Number.isFinite(parsedAmount)) {
                            setReimbursedAmount(String(parsedAmount));
                          }
                          if (!reimbursedAt) {
                            setReimbursedAt(new Date());
                          }
                        }
                      }}
                    >
                      {Object.entries(REIMBURSEMENT_STATUS_LABELS).map(
                        ([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ),
                      )}
                    </select>
                  </FormGroup>
                </div>

                {!isMileage && reimbursementStatus === 'reimbursed' ? (
                  <div className="rs-form-row">
                    <FormGroup
                      label="Reimbursed amount"
                      fieldId="expense-reimbursed-amt"
                    >
                      <TextInput
                        id="expense-reimbursed-amt"
                        type="number"
                        inputMode="decimal"
                        value={reimbursedAmount}
                        onChange={(_event, value) => setReimbursedAmount(value)}
                      />
                    </FormGroup>
                    <DateTimeInput
                      id="expense-reimbursed-at"
                      label="Reimbursed date" dateOnly
                      value={reimbursedAt}
                      onChange={setReimbursedAt}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>}
          <FormGroup label="Notes" fieldId="expense-note">
            <TextInput
              id="expense-note"
              value={note}
              onChange={(_event, value) => setNote(value)}
            />
          </FormGroup>

        </div>

        <footer className="rs-modal__footer rs-form-actions">
          {expense && onDelete ? (
            <Button variant="danger" isBlock onClick={onDelete}>
              Remove expense
            </Button>
          ) : null}
          <Button variant="primary" isBlock onClick={save} isDisabled={(!iPaid && !isMileage) || !validAmount}>
            Save expense
          </Button>
        </footer>
      </div>
    </div>
  );
}
