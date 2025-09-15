// Currency symbol mapping
export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  BRL: 'R$',
  MXN: 'MX$',
  KRW: '₩',
  SGD: 'S$',
  HKD: 'HK$',
  THB: '฿',
  MYR: 'RM',
  IDR: 'Rp',
  PHP: '₱',
  VND: '₫',
  AED: 'د.إ',
  SAR: '﷼',
  ILS: '₪',
  ZAR: 'R',
  EGP: 'E£',
  NGN: '₦',
  KES: 'KSh',
  ARS: 'AR$',
  CLP: 'CL$',
  COP: 'COL$',
  PEN: 'S/',
  UYU: 'UY$',
  CHF: 'CHF',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  PLN: 'zł',
  CZK: 'Kč',
  HUF: 'Ft',
  NZD: 'NZ$',
  TWD: 'NT$'
};

export function getCurrencySymbol(currency) {
  return CURRENCY_SYMBOLS[currency] || '$';
}

export function formatPrice(amount, currency = 'USD') {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toFixed(2)}`;
}

