import { sortOrders } from './constants';

const testObj = {
  asc: {
    name: 'asc',
    fullName: 'ascending',
  },
  desc: {
    name: 'desc',
    fullName: 'descending',
  }
};

describe('Constants', () => {
  test('PermissionsAccordion', () => {
    expect(sortOrders).toStrictEqual(testObj);
  });
});
