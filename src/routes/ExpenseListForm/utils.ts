import { personDefaultValues } from '../PersonListForm/defaultValues';
import { ExpenseType } from './types';

export const resetExpense = (expense: ExpenseType) => {
  const newExpense = {
    ...expense,
    items: expense.items.map((i) => ({
      ...i,
      payer: personDefaultValues,
      receiver: [''],
    })),
  };

  return newExpense;
};

// Helper to find the first error path in the nested error object, with better typing
function hasMessageProp(obj: unknown): obj is { message: unknown } {
  return typeof obj === 'object' && obj !== null && 'message' in obj;
}

export const findFirstErrorPath = (
  errorsObj: unknown,
  prefix: string[] = []
): string[] | null => {
  if (!errorsObj || typeof errorsObj !== 'object') return null;
  for (const key in errorsObj as Record<string, unknown>) {
    const value = (errorsObj as Record<string, unknown>)[key];
    if (hasMessageProp(value)) {
      return [...prefix, key];
    } else if (value && typeof value === 'object') {
      const result = findFirstErrorPath(value, [...prefix, key]);
      if (result) return result;
    }
  }
  return null;
};
