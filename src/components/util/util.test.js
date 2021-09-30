import '__mock__';
import {
  accountsMatchStatus,
  checkUserActive,
  formatActionDescription,
  formatCurrencyAmount,
  getChargeFineToLoanPath,
  getFullName,
  hasAnyLoanItemStatus,
  hasEveryLoanItemStatus,
  getContributors,
} from './util';

describe('accountsMatchStatus', () => {
  it('returns true if all accounts match', () => {
    const status = 'monkey';
    const accounts = [
      { id: '1234', status: { name: status } },
      { id: 'abcd', status: { name: status } },
    ];

    expect(accountsMatchStatus(accounts, status)).toBe(true);
  });

  it('returns false if any account does not match', () => {
    const status = 'monkey';
    const accounts = [
      { id: '1234', status: { name: status } },
      { id: 'abcd', status: { name: 'bagel' } },
    ];

    expect(accountsMatchStatus(accounts, status)).toBe(false);
  });

  it('returns true if accounts array is empty (vacuous truth)', () => {
    const status = 'monkey';
    expect(accountsMatchStatus(null, status)).toBe(true);
  });
});

describe('checkUserActive', () => {
  it('returns true for active users', () => {
    const user = {
      active: true,
      expirationDate: new Date(),
    };

    expect(checkUserActive(user)).toBe(true);
  });

  it('returns false for inactive users', () => {
    const user = {
      active: false,
      expirationDate: new Date(),
    };

    expect(checkUserActive(user)).toBe(false);
  });

  it('returns false for expired users', () => {
    const expDate = new Date();
    const user = {
      active: true,
      expirationDate: expDate.setDate(expDate.getDate() - 1),
    };

    expect(checkUserActive(user)).toBe(false);
  });

  it('returns true for active users without an expiration date', () => {
    const user = {
      active: true,
      expirationDate: undefined,
    };

    expect(checkUserActive(user)).toBe(true);
  });
});

describe('formatActionDescription', () => {
  it('includes action and method when present', () => {
    const action = {
      typeAction: 'monkey',
      paymentMethod: 'bagel',
    };

    expect(formatActionDescription(action)).toBe('monkey-bagel');
  });

  it('includes trailing space when method is absent', () => {
    const action = {
      typeAction: 'monkey',
    };

    expect(formatActionDescription(action)).toBe('monkey ');
  });
});

describe('formatCurrencyAmount', () => {
  it('correctly formats values', () => {
    expect(formatCurrencyAmount('1')).toBe('1.00');
    expect(formatCurrencyAmount('1.0')).toBe('1.00');
    expect(formatCurrencyAmount('1.00')).toBe('1.00');
    expect(formatCurrencyAmount('1.2')).toBe('1.20');
    expect(formatCurrencyAmount('1.23')).toBe('1.23');
    expect(formatCurrencyAmount('1.230')).toBe('1.23');
  });
});

describe('getChargeFineToLoanPath', () => {
  it('correctly formats string', () => {
    expect(getChargeFineToLoanPath('uid', 'lid')).toBe('/users/uid/charge/lid');
  });
});

describe('getFullName', () => {
  const firstName = 'John';
  const middleName = 'Jacob';
  const lastName = 'Jingle-Heimer-Schmidt';
  it('handles all names', () => {
    const user = {
      personal: {
        firstName,
        middleName,
        lastName,
      },
    };

    expect(getFullName(user)).toBe(`${lastName}, ${firstName} ${middleName}`);
  });

  it('handles missing middle name', () => {
    const user = {
      personal: {
        firstName,
        lastName,
      },
    };

    expect(getFullName(user)).toBe(`${lastName}, ${firstName}`);
  });

  it('handles missing first name', () => {
    const user = {
      personal: {
        middleName,
        lastName,
      },
    };

    expect(getFullName(user)).toBe(`${lastName}, ${middleName}`);
  });

  it('handles missing last name', () => {
    const user = {
      personal: {
        firstName,
      },
    };

    expect(getFullName(user)).toBe(`${firstName}`);
  });

  it('handles missing first and middle names', () => {
    const user = {
      personal: {
        lastName,
      },
    };

    expect(getFullName(user)).toBe(lastName);
  });

  it('handles missing first and last names', () => {
    const user = {
      personal: {
        middleName,
      },
    };

    expect(getFullName(user)).toBe(middleName);
  });

  it('handles missing last and middle names', () => {
    const user = {
      personal: {
        firstName,
      },
    };

    expect(getFullName(user)).toBe(firstName);
  });
});

describe('hasAnyLoanItemStatus', () => {
  it('returns true if all loans match', () => {
    const statuses = ['monkey', 'bagel', 'thunder', 'chicken'];
    const loans = [
      { id: '1234', item: { status: { name: 'monkey' } } },
      { id: 'abcd', item: { status: { name: 'bagel' } } },
    ];

    expect(hasAnyLoanItemStatus(loans, statuses)).toBe(true);
  });

  it('returns false if any loan does not match', () => {
    const statuses = ['monkey', 'bagel'];
    const loans = [
      { id: '1234', item: { status: { name: 'monkey' } } },
      { id: 'abcd', item: { status: { name: 'thunder' } } },
    ];

    expect(hasAnyLoanItemStatus(loans, statuses)).toBe(false);
  });

  it('returns true if loans array is empty (vacuous truth)', () => {
    const statuses = ['monkey', 'bagel'];
    expect(hasAnyLoanItemStatus(null, statuses)).toBe(true);
  });
});

describe('hasEveryLoanItemStatus', () => {
  it('returns true if all accounts match', () => {
    const status = 'monkey';
    const loans = [
      { id: '1234', item: { status: { name: status } } },
      { id: 'abcd', item: { status: { name: status } } },
    ];

    expect(hasEveryLoanItemStatus(loans, status)).toBe(true);
  });

  it('returns false if any account does not match', () => {
    const status = 'monkey';
    const loans = [
      { id: '1234', item: { status: { name: status } } },
      { id: 'abcd', item: { status: { name: 'bagel' } } },
    ];

    expect(hasEveryLoanItemStatus(loans, status)).toBe(false);
  });

  it('returns true if loans array is empty (vacuous truth)', () => {
    const status = 'monkey';
    const loans = null;

    expect(hasEveryLoanItemStatus(loans, status)).toBe(true);
  });
});

describe('getContributors', () => {
  it('should return undefined if nothing is passed', () => {
    expect(getContributors()).toBe();
  });

  it('should return contributors from `account` if it passed', () => {
    const mockedAccount = {
      contributors: [{ name: 'Bond,James' }, { name: 'Doe,John' }],
    };
    const mockedInstance = {
      contributors: [{ name: 'test' }],
    };
    const expectedResult = ['James, Bond', 'John, Doe'];

    expect(getContributors(mockedAccount, mockedInstance)).toEqual(expectedResult);
  });

  it('should return contributors from `instance` if `account` have no contributors', () => {
    const mockedAccount = {};
    const mockedInstance = {
      contributors: [{ name: 'Bond,James' }, { name: 'Doe,John' }],
    };
    const expectedResult = ['James, Bond', 'John, Doe'];

    expect(getContributors(mockedAccount, mockedInstance)).toEqual(expectedResult);
  });
});
