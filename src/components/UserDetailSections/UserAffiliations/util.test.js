import {
  createErrorMessage,
  extractTenantNameFromErrorMessage,
  getResponseErrors,
} from './util';

describe('getResponseErrors', () => {
  const errors = Array(2).fill().map((_, i) => ({
    status: 'rejected',
    reason: {
      response: {
        json: () => Promise.resolve({ errors: [{ message: `test ${i}` }] })
      },
    },
  }));

  it('should return empty array `[]`', async () => {
    expect(await getResponseErrors([])).toEqual([]);
    expect(await getResponseErrors()).toEqual([]);
    expect(await getResponseErrors({ status: 'fulfilled' })).toEqual([]);
  });
  it('should return a single error message', async () => {
    expect(await getResponseErrors(errors[0])).toEqual({ 'errors': [{ 'message': 'test 0' }] });
  });
  it('should return a single error message', async () => {
    const errorSchema = [{
      status: 'fulfilled',
      value: errors
    }];
    expect(await getResponseErrors(errorSchema)).toHaveLength(errors.length);
  });
});

describe('createErrorMessage', () => {
  it('should return a formatted error message', () => {
    const formattedError = createErrorMessage({
      message: 'User with id [0c50701e-45ff-4a2e-bff0-11bd5610378d] has primary affiliation with tenant [mobius]',
      code: 'HAS_PRIMARY_AFFILIATION_ERROR',
      userName: 'mobius',
    });
    expect(formattedError.props).toEqual({
      id: 'ui-users.affiliations.manager.modal.changes.error.hasPrimaryAffiliation',
      values: {
        tenantName: 'mobius',
        userName: 'mobius',
      },
    });
  });

  it('should return error message due to not supported error message', () => {
    const errorMessage = 'test error message';
    const formattedError = createErrorMessage({
      message: errorMessage,
      code: 'test',
      userName: 'test user',
    });
    expect(formattedError).toBe(errorMessage);
  });

  it('should return error message due to missing tenant name in message', () => {
    const errorMessage = 'test error message';
    const formattedError = createErrorMessage({
      message: errorMessage,
      code: 'HAS_PRIMARY_AFFILIATION_ERROR',
      userName: 'test user',
    });
    expect(formattedError.props).toEqual({
      id: 'ui-users.affiliations.manager.modal.changes.error.hasPrimaryAffiliation',
      values: {
        tenantName: '',
        userName: 'test user',
      },
    });
  });

  it('should return error message with tenant name `mobius`', () => {
    const errorMessage = 'Error message tenant mobius not fount';
    const formattedError = createErrorMessage({
      message: errorMessage,
      code: 'HAS_PRIMARY_AFFILIATION_ERROR',
      userName: 'test user',
    });
    expect(formattedError.props).toEqual({
      'id': 'ui-users.affiliations.manager.modal.changes.error.hasPrimaryAffiliation',
      'values': {
        'tenantName': 'mobius',
        'userName': 'test user',
      },
    });
  });
});

describe('extractTenantNameFromErrorMessage', () => {
  it('should return `mobius`', () => {
    const errorMessage = 'User with id [0c50701e-45ff-4a2e-bff0-11bd5610378d] has primary affiliation with tenant [mobius]';
    const tenantName = extractTenantNameFromErrorMessage(errorMessage);
    expect(tenantName).toBe('mobius');
  });

  it('should return empty string', () => {
    const errorMessage = 'Error message mobius not fount';
    const tenantName = extractTenantNameFromErrorMessage(errorMessage);
    expect(tenantName).toBe('');
  });
});

