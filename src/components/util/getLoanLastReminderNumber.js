import { FormattedMessage } from 'react-intl';

/**
 * getLoanLastReminderNumber
 * Return a JSX containing info about the last reminder fee based on:
 * https://github.com/folio-org/mod-circulation-storage/blob/cef90bb4e12739276ad5b7f36bd05932b05375ec/ramls/loan.json#L141
 *
 * @param object loan object
 *
 * @return JSX containing info about the last reminder fee if reminders are present
 * or null otherwise;
 */
export default function getLoanLastReminderNumber(loan) {
  const lastReminderNumber = loan?.reminders?.lastFeeBilled?.number;

  if (!lastReminderNumber) {
    return null;
  }

  return (
    <>
      <br />
      (<FormattedMessage id="ui-users.loans.lastReminderNumber" values={{ count: lastReminderNumber }} />)
    </>
  );
}
