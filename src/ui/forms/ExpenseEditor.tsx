import { useState } from 'react';
import { Button } from '@patternfly/react-core';
import type { Expense } from '@/domain/match';
import { formatExpenseCategory } from '@/domain/expenseCategories';
import { formatCurrency } from '@/domain/matchDisplay';
import { expenseOutOfPocket } from '@/features/matches/paySummary';
import { ExpenseSheet } from '@/ui/forms/ExpenseSheet';

type Props = {
  expenses: Expense[];
  onChange: (expenses: Expense[]) => void;
};

function reimbursementLabel(expense: Expense): string | null {
  if (expense.reimbursementStatus === 'reimbursed') return 'Reimbursed';
  if (expense.reimbursementStatus === 'pending') return 'Awaiting reimbursement';
  if (expense.reimbursementStatus === 'not_expected') return 'Self expense';
  return null;
}

export function ExpenseEditor({ expenses, onChange }: Props) {
  const [editing, setEditing] = useState<Expense | null>(null);
  const [showSheet, setShowSheet] = useState(false);

  const openNew = () => {
    setEditing(null);
    setShowSheet(true);
  };

  const openEdit = (expense: Expense) => {
    setEditing(expense);
    setShowSheet(true);
  };

  const removeExpense = (id: string) => {
    onChange(expenses.filter((expense) => expense.id !== id));
  };

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const outOfPocket = expenses.reduce(
    (sum, expense) => sum + expenseOutOfPocket(expense),
    0,
  );

  if (showSheet) {
    return (
      <ExpenseSheet
        expense={editing}
        onClose={() => {
          setShowSheet(false);
          setEditing(null);
        }}
        onSave={(expense) => {
          const exists = expenses.some((item) => item.id === expense.id);
          onChange(
            exists
              ? expenses.map((item) => (item.id === expense.id ? expense : item))
              : [...expenses, expense],
          );
          setShowSheet(false);
          setEditing(null);
        }}
      />
    );
  }

  return (
    <div className="rs-form-stack">
      {expenses.length === 0 ? (
        <p className="rs-form-hint">No expenses yet.</p>
      ) : (
        <ul className="rs-expense-list">
          {expenses.map((expense) => {
            const status = expense.miles != null ? null : reimbursementLabel(expense);

            return (
              <li key={expense.id} className="rs-expense-row">
                <div className="rs-expense-row__main">
                  <div className="rs-expense-row__summary">
                    <span className="rs-expense-row__category">
                      {formatExpenseCategory(expense.category)}
                    </span>
                    <span className="rs-expense-row__amount">
                      {expense.miles != null ? `${expense.miles} miles` : formatCurrency(expense.amount)}
                    </span>
                  </div>
                  {status ? (
                    <span className="rs-expense-row__meta">{status}</span>
                  ) : null}
                  {expense.note ? (
                    <span className="rs-expense-row__note">{expense.note}</span>
                  ) : null}
                </div>
                <div className="rs-expense-row__actions">
                  <Button variant="link" onClick={() => openEdit(expense)}>
                    Edit
                  </Button>
                  <Button
                    variant="link"
                    isDanger
                    onClick={() => removeExpense(expense.id)}
                  >
                    Remove
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <div className="rs-expense-footer">
        <Button variant="secondary" onClick={openNew}>
          Add other expenses/Miles driven or flown
        </Button>
        {expenses.length > 0 ? (
          <p className="rs-expense-total">
            Total: {formatCurrency(total)} · Out of pocket:{' '}
            {formatCurrency(outOfPocket)}
          </p>
        ) : null}
      </div>
    </div>
  );
}
