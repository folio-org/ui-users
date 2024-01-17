export const getFormattedCurrency = (value, currency, intl) => {
  return intl.formatNumber(value, { style: 'currency', currency });
};
