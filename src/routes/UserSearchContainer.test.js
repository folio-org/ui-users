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
const mockHasInterface = jest.fn().mockReturnValue(0);
const props = {
  stripes: {
    hasInterface: mockHasInterface,
  }
};

describe('buildQuery', () => {
  it('should return empty CQL query', () => {
    expect(buildQuery({}, pathComponents, { query: {} }, logger, props)).toBeFalsy();
  });

  it('should include username when building CQL query when stripes "users" interface is less than 16.3', () => {
    expect(buildQuery(queryParams, pathComponents, resourceData, logger, props)).toEqual(expect.stringContaining('username="Joe*"'));
  });

  it('should include "keywords" when building CQL query when stripes "users" interface is 16.3', () => {
    mockHasInterface.mockReturnValue(16.3);
    expect(buildQuery(queryParams, pathComponents, resourceData, logger, props)).toEqual(expect.stringContaining('keywords="Joe*"'));
  });
});
