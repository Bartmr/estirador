import { Logger } from '../../logging/logger';

const formatCurrencyAmount = (value: string | number | undefined): string => {
  if (typeof value === 'undefined') {
    return '';
  }

  const parsedValue = typeof value === 'string' ? Number(value) : value;

  if (isNaN(parsedValue)) {
    Logger.logError('cannot-parsed-currency-value-string', new Error());

    return '';
  }

  return parsedValue.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
};

export function useFormatCurrencyAmount() {
  return formatCurrencyAmount;
}
