import { ExpenseType } from '../ExpenseListForm/types';
import { PersonType } from '../PersonListForm/types';

export type EventType = {
  id: string;
  title: string;
  personList: PersonType[];
  expense: ExpenseType;
};
