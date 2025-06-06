import { PersonType } from '../PersonListForm/types';

export type ItemType = {
  title: string;
  price: number;
  formattedStringPrice: string;
  payer: PersonType;
  receiver: string[];
};

export type DynacicPercentageValue = 'PERCENTAGE' | 'AMOUNT';

export type ExpenseType = {
  items: ItemType[];
  tax: {
    value: number;
    type: DynacicPercentageValue;
  };
  discount: {
    value: number;
    type: DynacicPercentageValue;
  };
  serviceCharge: {
    value: number;
    type: DynacicPercentageValue;
  };
};
