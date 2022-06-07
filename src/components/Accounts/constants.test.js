import { sortMap } from './constants';

const testObj = {
  'item': jest.fn(),
  'charged': jest.fn(),
  'remaining': jest.fn(),
  'barcode': jest.fn(),
  'date created': jest.fn(),
  'date updated': jest.fn(),
  'fee/fine type': jest.fn(),
  'fee/fine owner': jest.fn(),
  'call number': jest.fn(),
};

describe('Constants', () => {
  test('Accounts', () => {
    expect(sortMap.length).toBe(testObj.length);
  });
});
