import { PersonType } from '../PersonListForm/types';

export type ItemType = {
  title: string;
  price: number;
  payer: PersonType;
  receiver: string[];
};

export type ExpenseType = {
  items: ItemType[];
  tax: number;
  discount: number;
};
