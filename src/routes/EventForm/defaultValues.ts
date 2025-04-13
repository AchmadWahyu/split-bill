import { expenseDefaultValues } from '../ExpenseListForm/defaultValues';
import { personDefaultValues } from '../PersonListForm/defaultValues';
import { EventType } from './types';

export const eventDefaultValues: EventType = {
  id: '',
  title: '',
  personList: [personDefaultValues],
  expense: expenseDefaultValues,
};
