import { refundClaimReturned,
  requestStatuses,
  itemStatuses,
  loanStatuses,
  accountStatuses,
  loanActions,
  loanActionMutators,
  deliveryFulfillmentValues,
  sortTypes,
  statusFilter } from './constants';

/* Change the length of the imported constants in test files if constant files are changed */

describe('Constants', () => {
  test('refundClaimReturned', () => {
    expect(Object.keys(refundClaimReturned).length).toEqual(11);
  });
  test('requestStatuses', () => {
    expect(Object.keys(requestStatuses).length).toEqual(8);
  });
  test('itemStatuses', () => {
    expect(Object.keys(itemStatuses).length).toEqual(4);
  });
  test('loanStatuses', () => {
    expect(Object.keys(loanStatuses).length).toEqual(1);
  });
  test('accountStatuses', () => {
    expect(Object.keys(accountStatuses).length).toEqual(2);
  });
  test('loanActions', () => {
    expect(Object.keys(loanActions).length).toEqual(4);
  });
  test('loanActionMutators', () => {
    expect(Object.keys(loanActionMutators).length).toEqual(3);
  });
  test('deliveryFulfillmentValues', () => {
    expect(Object.keys(deliveryFulfillmentValues).length).toEqual(2);
  });
  test('sortTypes', () => {
    expect(Object.keys(sortTypes).length).toEqual(2);
  });
  test('statusFilter', () => {
    expect(Object.keys(statusFilter).length).toEqual(2);
  });
  test('loanActions', () => {
    expect(Object.keys(loanActions).length).toEqual(4);
  });
});
