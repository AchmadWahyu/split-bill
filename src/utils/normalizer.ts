import { eventDefaultValues } from '../routes/EventForm/defaultValues';
import { EventType } from '../routes/EventForm/types';
import { itemDefaultValues } from '../routes/ExpenseListForm/defaultValues';
import { personDefaultValues } from '../routes/PersonListForm/defaultValues';

export const normalizeEventData = (event: EventType | undefined): EventType => {
  return {
    id: event?.id || '',
    title: event?.title || '',
    personList:
      !event?.personList || event?.personList?.length === 0
        ? [personDefaultValues]
        : event?.personList,
    expense: {
      items:
        !event?.expense?.items || event?.expense?.items?.length === 0
          ? [itemDefaultValues]
          : event?.expense?.items,
      tax: {
        type: event?.expense?.tax?.type || 'PERCENTAGE',
        value: event?.expense?.tax?.value || '0',
      },
      discount: {
        type: event?.expense?.discount?.type || 'PERCENTAGE',
        value: event?.expense?.discount?.value || '0',
      },
      serviceCharge: {
        type: event?.expense?.serviceCharge?.type || 'PERCENTAGE',
        value: event?.expense?.serviceCharge?.value || '0',
      },
    },
  };
};

export const normalizeEventListData = (
  eventList: string | null
): EventType[] => {
  if (!eventList) {
    return [eventDefaultValues];
  }

  return JSON.parse(eventList);
};
