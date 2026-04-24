import buildQueryByIds from './buildQueryByIds';

describe('buildQueryByIds', () => {
  it('should create query with id', () => {
    const ids = ['1', '2'];

    expect(buildQueryByIds(ids)).toBe('id==1 or id==2');
  });

  it('should return empty string', () => {
    expect(buildQueryByIds([])).toBe('');
  });
});
