import { personDefaultValues } from '../PersonListForm/defaultValues';
import { ExpenseType } from './types';

export const expenseDefaultValues: ExpenseType = {
  title: '',
  priceBeforeTax: 0,
  priceAfterTax: 0,
  tax: 0,
  payer: personDefaultValues,
  receiver: [''],
};
