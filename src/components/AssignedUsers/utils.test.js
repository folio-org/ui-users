import { getUpdatedUsersList } from './utils';

describe('getUpdatedUsersList', () => {
  const cases = [
    { prevUsers: undefined, newUsers: undefined },
    { prevUsers: null, newUsers: null },
    { prevUsers: [], newUsers: null },
    { prevUsers: null, newUsers: [] },
    { prevUsers: [], newUsers: undefined },
    { prevUsers: undefined, newUsers: [] },
    { prevUsers: [], newUsers: [] },
  ];

  it.each(cases)('should return empty data', ({ prevUsers, newUsers }) => {
    const result = getUpdatedUsersList(prevUsers, newUsers);

    expect(result).toEqual({ added: [], removed: [] });
  });

  it('should return empty data', () => {
    const prevUsers = [{ id: '1' }];
    const newUsers = [{ id: '1' }];
    const result = getUpdatedUsersList(prevUsers, newUsers);

    expect(result).toEqual({ added: [], removed: [] });
  });

  it('should return empty data', () => {
    const result = getUpdatedUsersList();

    expect(result).toEqual({ added: [], removed: [] });
  });

  it('should return newly added users data', () => {
    const prevUsers = [{ id: '1' }];
    const newUsers = [{ id: '1' }, { id: '2' }];
    const result = getUpdatedUsersList(prevUsers, newUsers);

    expect(result).toEqual({ added: [{ id: '2' }], removed: [] });
  });

  it('should return removed users data', () => {
    const prevUsers = [{ id: '1' }, { id: '2' }];
    const newUsers = [{ id: '1' }];
    const result = getUpdatedUsersList(prevUsers, newUsers);

    expect(result).toEqual({ added: [], removed: [{ id: '2' }] });
  });
  it('should return removed users data', () => {
    const prevUsers = [{ id: '1' }, { id: '2' }];
    const newUsers = [{ id: '1' }];
    const result = getUpdatedUsersList(prevUsers, newUsers);

    expect(result).toEqual({ added: [], removed: [{ id: '2' }] });
  });

  it('should return removed and added users data', () => {
    const prevUsers = [{ id: '1' }, { id: '2' }];
    const newUsers = [{ id: '1' }, { id: '3' }];
    const result = getUpdatedUsersList(prevUsers, newUsers);

    expect(result).toEqual({ added: [{ id: '3' }], removed: [{ id: '2' }] });
  });
});
