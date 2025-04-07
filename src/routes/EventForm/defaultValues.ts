import { expenseDefaultValues } from '../ExpenseListForm/defaultValues';
import { personDefaultValues } from '../PersonListForm/defaultValues';

export const eventDefaultValues = {
  id: '',
  title: '',
  personList: [personDefaultValues],
  expenseList: [expenseDefaultValues],
};
