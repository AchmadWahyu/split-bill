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
