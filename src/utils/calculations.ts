import { DynacicPercentageValue, ExpenseType } from '../types';

export type PersonItemBreakdown = {
  title: string;
  totalPrice: number;
  totalReceivers: number;
  pricePerPerson: number;
};

export type PersonShareBreakdown = {
  name: string;
  items: PersonItemBreakdown[];
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  total: number;
  itemCount: number;
};

function getAmount(
  type: DynacicPercentageValue,
  value: string | number,
  ratio: number,
  baseAmount: number
): number {
  const numValue = Number(value);
  if (type === 'AMOUNT') return numValue * ratio;
  if (!numValue) return 0;
  return (numValue / 100) * baseAmount;
}

export function calculatePersonShares(
  expense: ExpenseType,
  personNames: string[]
): PersonShareBreakdown[] {
  const { items, tax, discount, serviceCharge } = expense;
  const totalExpense = items.reduce(
    (sum, item) => sum + Number(item.price),
    0
  );

  return personNames.map((person) => {
    const personItems = items
      .filter((item) =>
        item.receiver.filter((r) => Boolean(r)).includes(person)
      )
      .map((item) => {
        const totalReceivers = item.receiver.filter((r) => Boolean(r)).length;
        const pricePerPerson = Number(item.price) / totalReceivers;
        return {
          title: item.title,
          totalPrice: Number(item.price),
          totalReceivers,
          pricePerPerson,
        };
      });

    let totalTax = 0;
    let totalService = 0;
    let totalDiscount = 0;

    personItems.forEach((item) => {
      const ratio =
        totalExpense > 0 ? item.pricePerPerson / totalExpense : 0;

      const discountForItem = getAmount(
        discount.type,
        discount.value,
        ratio,
        item.pricePerPerson
      );
      const serviceForItem = getAmount(
        serviceCharge.type,
        serviceCharge.value,
        ratio,
        item.pricePerPerson
      );
      const adjustedPrice =
        item.pricePerPerson - discountForItem + serviceForItem;
      const taxForItem = getAmount(tax.type, tax.value, ratio, adjustedPrice);

      totalTax += taxForItem;
      totalService += serviceForItem;
      totalDiscount += discountForItem;
    });

    const subtotal = personItems.reduce(
      (sum, item) => sum + item.pricePerPerson,
      0
    );
    const total = subtotal + totalTax + totalService - totalDiscount;

    return {
      name: person,
      items: personItems,
      subtotal,
      tax: totalTax,
      serviceCharge: totalService,
      discount: totalDiscount,
      total,
      itemCount: personItems.length,
    };
  });
}

export function calculateTotalFromShares(
  shares: PersonShareBreakdown[]
): number {
  return shares.reduce((sum, person) => sum + person.total, 0);
}
