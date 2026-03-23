export type PersonType = {
  name: string;
};

export type DynacicPercentageValue = 'PERCENTAGE' | 'AMOUNT';

export type ItemType = {
  title: string;
  price: string;
  payer?: PersonType;
  receiver: string[];
};

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

export type EventType = {
  id: string;
  title: string;
  personList: PersonType[];
  expense: ExpenseType;
};
