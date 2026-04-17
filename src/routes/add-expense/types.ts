import type { EventType } from '@/types';

export type AddExpensePageProps = {
  eventList: EventType[];
  handleUpdateEventById: (data: EventType) => void;
};

export type AddExpenseFormValues = {
  title: string;
  /** Synthetic field for person-strip validation errors only */
  personList?: string;
  expense: {
    items: {
      title: string;
      price: string;
      receiver: string[];
    }[];
    tax: string;
    discount: string;
    serviceCharge: string;
  };
};
