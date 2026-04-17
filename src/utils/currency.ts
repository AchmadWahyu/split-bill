import { ExpenseType } from '../types';

export const formatCurrencyIDR = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatThousandSeparator = (value: string): string => {
  const parsedToStringValue = String(value);

  const num = Number(parsedToStringValue.replace(/\D/g, ''));
  return isNaN(num) ? '' : new Intl.NumberFormat('id-ID').format(num);
};

export const unformatThousandSeparator = (formatted: string): string =>
  formatted.replace(/\D/g, '');

export const calculateTotalExpense = (expense: ExpenseType): number => {
  const subtotal = expense.items.reduce(
    (sum, item) => sum + Number(item.price),
    0
  );

  const discountValue = Number(expense.discount.value);
  const discount =
    expense.discount.type === 'PERCENTAGE'
      ? (discountValue / 100) * subtotal
      : discountValue;

  const serviceChargeValue = Number(expense.serviceCharge.value);
  const serviceCharge =
    expense.serviceCharge.type === 'PERCENTAGE'
      ? (serviceChargeValue / 100) * (subtotal - discount)
      : serviceChargeValue;

  const taxValue = Number(expense.tax.value);
  const tax =
    expense.tax.type === 'PERCENTAGE'
      ? (taxValue / 100) * (subtotal - discount + serviceCharge)
      : taxValue;

  return subtotal - discount + serviceCharge + tax;
};
