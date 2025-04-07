import { EventType } from '../routes/EventForm/types';
import { expenseDefaultValues } from '../routes/ExpenseListForm/defaultValues';
import { personDefaultValues } from '../routes/PersonListForm/defaultValues';

export const normalizeEventData = (event: EventType | undefined) => {
  return {
    id: event?.id || '',
    title: event?.title || '',
    personList: event?.personList || [personDefaultValues],
    expenseList: event?.expenseList || [expenseDefaultValues],
  };
};
