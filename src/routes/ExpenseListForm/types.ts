import { PersonType } from '../PersonListForm/types';

export type ExpenseType = {
  title: string;
  priceBeforeTax: number;
  priceAfterTax: number;
  tax: number;
  payer: PersonType;
  receiver: string[];
};
