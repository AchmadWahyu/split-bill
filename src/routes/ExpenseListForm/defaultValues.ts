import { personDefaultValues } from '../PersonListForm/defaultValues';
import { ExpenseType, ItemType } from './types';

export const itemDefaultValues: ItemType = {
  title: '',
  price: 0,
  formattedStringPrice: '',
  payer: personDefaultValues,
  receiver: [''],
};

export const expenseDefaultValues: ExpenseType = {
  items: [itemDefaultValues],
  tax: {
    value: 0,
    type: 'PERCENTAGE',
  },
  discount: {
    value: 0,
    type: 'AMOUNT',
  },
  serviceCharge: {
    value: 0,
    type: 'AMOUNT',
  },
};
