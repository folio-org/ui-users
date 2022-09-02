import '__mock__';
import okapiUser from 'fixtures/okapiCurrentUser';
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
  formatDateAndTime,
  getServicePointOfCurrentAction,
  calculateRemainingAmount,
  validate,
  getRecordObject,
  retrieveNoteReferredEntityDataFromLocationState,
  getClosedRequestStatusesFilterString,
  getOpenRequestStatusesFilterString
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
  const preferredFirstName = 'Johnnie';
  const lastName = 'Jingle-Heimer-Schmidt';
  it('handles all names', () => {
    const user = {
      personal: {
        firstName,
        preferredFirstName,
        middleName,
        lastName,
      },
    };

    expect(getFullName(user)).toBe(`${lastName}, ${preferredFirstName} ${middleName}`);
  });

  it('handles missing preferred first name', () => {
    const user = {
      personal: {
        firstName,
        middleName,
        lastName,
      },
    };

    expect(getFullName(user)).toBe(`${lastName}, ${firstName} ${middleName}`);
  });

  it('handles empty preferred first name', () => {
    const user = {
      personal: {
        firstName,
        middleName,
        lastName,
        preferredFirstName: '',
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
      contributors: [{ name: 'Bond, James' }, { name: 'Doe, John' }],
    };
    const mockedInstance = {
      contributors: [{ name: 'test' }],
    };
    const expectedResult = ['Bond, James', 'Doe, John'];

    expect(getContributors(mockedAccount, mockedInstance)).toEqual(expectedResult);
  });

  it('should return contributors from `instance` if `account` have no contributors', () => {
    const mockedAccount = {};
    const mockedInstance = {
      contributors: [{ name: 'Bond, James' }, { name: 'Doe, John' }],
    };
    const expectedResult = ['Bond, James', 'Doe, John'];

    expect(getContributors(mockedAccount, mockedInstance)).toEqual(expectedResult);
  });
  it('formatDateAndTime', () => {
    const formatterMock = jest.fn();
    formatDateAndTime('21/02/2022', formatterMock);
    expect(formatterMock).toHaveBeenCalled();
  });
  it('getServicePointOfCurrentAction', () => {
    const action = {
      createdAt: '7c5abc9f-f3d7-4856-b8d7-6712462ca007'
    };
    const data = getServicePointOfCurrentAction(action, okapiUser.servicePoints);
    expect(data).toBe('Online');
  });
  it('calculateRemainingAmount', () => {
    const data = calculateRemainingAmount('22.00');
    expect(data).toBe(22);
  });
  it('validate', () => {
    const data = validate({ value: '22.00' }, 2, [{ value: '21.00' },
      { value: '23.00' }, { value: '24.00' }], 'value', 'test');
    expect(data).toStrictEqual({});
  });
  it('getRecordObject  ', () => {
    const resources = {
      account: {
        records: []
      }
    };
    const data = getRecordObject(resources, ['account']);
    expect(data).toStrictEqual({ account: [] });
  });
  it('retrieveNoteReferredEntityDataFromLocationState  ', () => {
    const data = retrieveNoteReferredEntityDataFromLocationState({
      entityId: 'testId',
      entityName: 'testName',
      entityType: 'testType'
    });
    expect(data).toStrictEqual({
      name: 'testName',
      type: 'testType',
      id: 'testId',
    });
    const data1 = retrieveNoteReferredEntityDataFromLocationState();
    expect(data1).toBeNull();
  });
  it('getClosedRequestStatusesFilterString  ', () => {
    const data = getClosedRequestStatusesFilterString();
    expect(data).toStrictEqual('requestStatus.Closed - Pickup expired,requestStatus.Closed - Cancelled,requestStatus.Closed - Filled,requestStatus.Closed - Unfilled');
  });
  it('getOpenRequestStatusesFilterString  ', () => {
    const data = getOpenRequestStatusesFilterString();
    expect(data).toStrictEqual('requestStatus.Open - Awaiting pickup,requestStatus.Open - Awaiting delivery,requestStatus.Open - In transit,requestStatus.Open - Not yet filled');
  });
});
