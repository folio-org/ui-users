export const localizeCurrencyAmount = (value, currency, intl) => {
  return intl.formatNumber(value, { style: 'currency', currency });
};
