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

describe('buildQuery', () => {
  it('should exclude shadow users when building CQL query', () => {
    expect(buildQuery(queryParams, pathComponents, resourceData, logger)).toEqual(expect.stringContaining(NOT_SHADOW_USER_CQL));
  });
});
