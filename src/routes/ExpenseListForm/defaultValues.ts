import { personDefaultValues } from '../PersonListForm/defaultValues';
import { ExpenseType, ItemType } from './types';

export const itemDefaultValues: ItemType = {
  title: '',
  price: 0,
  payer: personDefaultValues,
  receiver: [''],
};

export const expenseDefaultValues: ExpenseType = {
  items: [itemDefaultValues],
  tax: 0,
  discount: 0,
};
