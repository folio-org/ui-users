import { findObjectDifferences } from './utils';

describe('findObjectDifferences', () => {
  it('should return empty data', () => {
    const prevUsers = [];
    const newUsers = [];
    const result = findObjectDifferences(prevUsers, newUsers);

    expect(result).toEqual({ added: [], removed: [] });
  });

  it('should return empty data', () => {
    const prevUsers = [{ id: '1' }];
    const newUsers = [{ id: '1' }];
    const result = findObjectDifferences(prevUsers, newUsers);

    expect(result).toEqual({ added: [], removed: [] });
  });

  it('should return newly added users data', () => {
    const prevUsers = [{ id: '1' }];
    const newUsers = [{ id: '1' }, { id: '2' }];
    const result = findObjectDifferences(prevUsers, newUsers);

    expect(result).toEqual({ added: [{ id: '2' }], removed: [] });
  });

  it('should return removed users data', () => {
    const prevUsers = [{ id: '1' }, { id: '2' }];
    const newUsers = [{ id: '1' }];
    const result = findObjectDifferences(prevUsers, newUsers);

    expect(result).toEqual({ added: [], removed: [{ id: '2' }] });
  });
  it('should return removed users data', () => {
    const prevUsers = [{ id: '1' }, { id: '2' }];
    const newUsers = [{ id: '1' }];
    const result = findObjectDifferences(prevUsers, newUsers);

    expect(result).toEqual({ added: [], removed: [{ id: '2' }] });
  });

  it('should return removed and added users data', () => {
    const prevUsers = [{ id: '1' }, { id: '2' }];
    const newUsers = [{ id: '1' }, { id: '3' }];
    const result = findObjectDifferences(prevUsers, newUsers);

    expect(result).toEqual({ added: [{ id: '3' }], removed: [{ id: '2' }] });
  });
});
