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
