import '../../../test/jest/__mock__';
import {
  accountsMatchStatus,
  calculateRemainingAmount,
  calculateSortParams,
  checkUserActive,
  formatActionDescription,
  formatCurrencyAmount,
  formatDateAndTime,
  getChargeFineToLoanPath,
  getClosedRequestStatusesFilterString,
  getFilterStatusesString,
  getFullName,
  getOpenRequestsPath,
  getOpenRequestStatusesFilterString,
  getRecordObject,
  getServicePointOfCurrentAction,
  getValue,
  hasAnyLoanItemStatus,
  hasEveryLoanItemStatus,
  retrieveNoteReferredEntityDataFromLocationState,
  validate,
} from './util';

/*



export const formatDateAndTime = (date, formatter) => {
  return date ? formatter(date, { day: 'numeric', month: 'numeric', year: 'numeric' }) : '';
};

export const getServicePointOfCurrentAction = (action, servicePoints = []) => {
  const servicePoint = servicePoints.find(sp => sp.id === action.createdAt);

  return servicePoint ? servicePoint.name : action.createdAt;
};

export const calculateRemainingAmount = (remaining) => (parseFloat(remaining) * 100) / 100;

export function validate(item, index, items, field, label) {
  const error = {};
  for (let i = 0; i < items.length; i++) {
    const obj = items[i];
    if ((index !== i) && ((obj[field] || '').localeCompare(item[field], 'sv', { sensitivity: 'base' }) === 0)) {
      error[field] = (
        <FormattedMessage
          id="ui-users.duplicated"
          values={{ field: label }}
        />
      );
    }
  }
  return error;
}

export function getRecordObject(resources, ...args) {
  const res = {};
  args.forEach((resource) => {
    res[resource] = resources[resource].records;
  });
  return res;
}

export function retrieveNoteReferredEntityDataFromLocationState(state) {
  if (state) {
    return {
      name: state.entityName,
      type: state.entityType,
      id: state.entityId,
    };
  }

  return null;
}

export function getFilterStatusesString(statuses) {
  return statuses.map(status => `requestStatus.${status}`).join(',');
}

export function getClosedRequestStatusesFilterString() {
  const closedStatusesArr = [
    requestStatuses.PICKUP_EXPIRED,
    requestStatuses.CANCELLED,
    requestStatuses.FILLED,
    requestStatuses.UNFILLED,
  ];

  return getFilterStatusesString(closedStatusesArr);
}

export function getOpenRequestStatusesFilterString() {
  const openStatusesArr = [
    requestStatuses.AWAITING_PICKUP,
    requestStatuses.AWAITING_DELIVERY,
    requestStatuses.IN_TRANSIT,
    requestStatuses.NOT_YET_FILLED,
  ];

  return getFilterStatusesString(openStatusesArr);
}


export function calculateSortParams({
  sortOrder,
  sortValue,
  sortDirection,
  secondarySortOrderIndex = 0,
  secondarySortDirectionIndex = 0,
}) {
  const sortParams = {};

  if (sortOrder[0] !== sortValue) {
    sortParams.sortOrder = [sortValue, sortOrder[secondarySortOrderIndex]];
    sortParams.sortDirection = [sortTypes.ASC, sortDirection[secondarySortDirectionIndex]];
  } else {
    const direction = sortDirection[0] === sortTypes.DESC ? sortTypes.ASC : sortTypes.DESC;

    sortParams.sortDirection = [direction, sortDirection[1]];
  }

  return sortParams;
}



export function getValue(value) {
  return value || '';
}

*/

describe('accountsMatchStatus', () => {
  it('returns true if all accounts match', () => {
    const status = 'monkey';
    const accounts = [
      { id: '1234', status: { name: status }},
      { id: 'abcd', status: { name: status }},
    ];

    expect(accountsMatchStatus(accounts, status)).toBe(true);
  });

  it('returns false if any account does not match', () => {
    const status = 'monkey';
    const accounts = [
      { id: '1234', status: { name: status }},
      { id: 'abcd', status: { name: 'bagel' }},
    ];

    expect(accountsMatchStatus(accounts, status)).toBe(false);
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

    expect(getFullName(user)).toBe(`${lastName}, ${firstName}`);
  });

  it('handles missing first and middle names', () => {
    const user = {
      personal: {
        lastName,
      },
    };

    expect(getFullName(user)).toBe(`${lastName}`);
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
});

describe('hasEveryLoanItemStatus', () => {
  it('returns true if all accounts match', () => {
    const status = 'monkey';
    const loans = [
      { id: '1234', item: { status: { name: 'monkey' } } },
      { id: 'abcd', item: { status: { name: 'bagel' } } },
    ];

    expect(hasEveryLoanItemStatus(loans, status)).toBe(true);
  });

  it('returns false if any account does not match', () => {
    const status = 'monkey';
    const loans = [
      { id: '1234', item: { status: { name: 'monkey' } } },
      { id: 'abcd', item: { status: { name: 'bagel' } } },
    ];

    expect(hasEveryLoanItemStatus(loans, status)).toBe(false);
  });
});
