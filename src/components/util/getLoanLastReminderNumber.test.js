import { FormattedMessage } from 'react-intl';
import getLoanLastReminderNumber from './getLoanLastReminderNumber';

describe('getLoanLastReminderNumber', () => {
  it('should return null if lastReminderNumber is not present', () => {
    const result = getLoanLastReminderNumber({});
    expect(result).toBeNull();
  });

  it('should return JSX containing info about the last reminder fee if lastReminderNumber is present', () => {
    const loan = {
      reminders: {
        lastFeeBilled: {
          number: 2,
        },
      },
    };
    const result = getLoanLastReminderNumber(loan);
    const expected = (
      <>
        <br />
        (<FormattedMessage id="ui-users.loans.lastReminderNumber" values={{ count: 2 }} />)
      </>
    );
    expect(result).toEqual(expected);
  });
});
