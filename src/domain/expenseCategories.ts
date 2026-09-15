import type { ExpenseCategory } from '@/domain/match';

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  miles_driven: 'Miles driven',
  miles_flown: 'Miles flown',
  gas: 'Gas',
  lodging: 'Lodging',
  food: 'Food',
  rental_car: 'Rental car',
  rideshare: 'Uber / rideshare',
  parking: 'Parking',
  tolls: 'Tolls',
  airfare: 'Airfare',
  other: 'Other',
};

export function formatExpenseCategory(category: ExpenseCategory): string {
  return EXPENSE_CATEGORY_LABELS[category];
}
