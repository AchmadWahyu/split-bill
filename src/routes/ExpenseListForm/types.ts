import { PersonType } from '../PersonListForm/types';

export type ItemType = {
  title: string;
  price: string;
  payer: PersonType;
  receiver: string[];
};

export type DynacicPercentageValue = 'PERCENTAGE' | 'AMOUNT';

export type ExpenseType = {
  items: ItemType[];
  tax: {
    value: string;
    type: DynacicPercentageValue;
  };
  discount: {
    value: string;
    type: DynacicPercentageValue;
  };
  serviceCharge: {
    value: string;
    type: DynacicPercentageValue;
  };
};
