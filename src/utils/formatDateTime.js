/**
 * Formats a date/time value as a localised string using intl.formatDate.
 * Returns null for falsy input.
 * For JSX output see renderDateTime.
 */
export const formatDateTime = (value, formatDate) => (
  value
    ? formatDate(value, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    })
    : null
);
