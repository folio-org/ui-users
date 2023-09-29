import { buildQuery } from './UserSearchContainer';

const queryParams = {
  filters: 'active.active',
  query: 'Joe',
  sort: 'name',
};
const pathComponents = {};
const resourceData = {
  query: queryParams,
};
const logger = {
  log: jest.fn(),
};
const mockHasInterface = jest.fn().mockReturnValue(false);
const props = {
  stripes: {
    hasInterface: mockHasInterface,
  }
};

describe('buildQuery', () => {
  it('should return empty CQL query', () => {
    expect(buildQuery({}, pathComponents, { query: {} }, logger, props)).toBeFalsy();
  });

  it('should include username when building CQL query', () => {
    mockHasInterface.mockReturnValue(true);
    expect(buildQuery(queryParams, pathComponents, resourceData, logger, props)).toEqual(expect.stringContaining('username="Joe*"'));
  });
});
