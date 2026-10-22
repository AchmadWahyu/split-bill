export type PersonType = {
  name: string;
};

export type DynacicPercentageValue = 'PERCENTAGE' | 'AMOUNT';

export type FeeType = {
  value: string;
  type: DynacicPercentageValue;
};

export type ItemType = {
  title: string;
  price: string;
  payer?: PersonType;
  receiver: string[];
  receiptId?: string;
};

export type ExpenseType = {
  items: ItemType[];
  tax: FeeType;
  discount: FeeType;
  serviceCharge: FeeType;
};

export type ReceiptMetaType = {
  id: string;
  name: string;
  tax: FeeType;
  discount: FeeType;
  serviceCharge: FeeType;
};

export type EventType = {
  id: string;
  title: string;
  personList: PersonType[];
  expense: ExpenseType;
  receipts: ReceiptMetaType[];
};
