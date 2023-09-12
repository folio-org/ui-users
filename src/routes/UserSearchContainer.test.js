import {
  buildQuery,
  NOT_SHADOW_USER_CQL,
} from './UserSearchContainer';

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
  it('should exclude shadow users when building CQL query', () => {
    expect(buildQuery(queryParams, pathComponents, resourceData, logger, props)).toEqual(expect.stringContaining(NOT_SHADOW_USER_CQL));
  });

  it('should include username when building CQL query', () => {
    mockHasInterface.mockReturnValue(true);
    expect(buildQuery(queryParams, pathComponents, resourceData, logger, props)).toEqual(expect.stringContaining('username="Joe*"'));
  });
});
