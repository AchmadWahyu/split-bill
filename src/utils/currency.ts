export const formatCurrencyIDR = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatNumberWithThousandSeparator = (value: number): string => {
  const formatter = new Intl.NumberFormat('id-ID');
  return formatter.format(value);
};
