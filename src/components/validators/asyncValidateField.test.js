import { waitFor } from '@folio/jest-config-stripes/testing-library/react';

import asyncValidateField from './asyncValidateField';
import memoize from '../util/memoize';

jest.mock('../util/memoize', () => jest.fn());

memoize.mockImplementation((fn) => fn('TestData'));

const mockReponse = ['test', 'test2'];
const mockValidator = {
  GET: jest.fn(() => Promise.resolve([])),
  reset: jest.fn(),
};

describe('Async Validate Field component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('if  it validates', async () => {
    const fieldName = 'username';
    const initValue = 'test';
    const validator = {
      reset: jest.fn(),
      GET: jest.fn(() => new Promise(res => res(mockReponse))),
    };
    const data = await waitFor(() => asyncValidateField(fieldName, initValue, validator));
    expect(data.props.id).toBe('ui-users.errors.usernameUnavailable');
  });
  it('if initValue and memoize function has same data', async () => {
    const fieldName = 'username';
    const initValue = 'TestData';
    const validator = {
      reset: jest.fn(),
      GET: jest.fn(() => new Promise(res => res(mockReponse))),
    };
    const data = await waitFor(() => asyncValidateField(fieldName, initValue, validator));
    expect(data).toBe('');
  });
  it('if no validator data is passed', async () => {
    const fieldName = 'username';
    const initValue = 'Test';
    const validator = {
      reset: jest.fn(),
      GET: jest.fn(() => new Promise(res => res([]))),
    };
    const data = await waitFor(() => asyncValidateField(fieldName, initValue, validator));
    expect(data).toBe('');
  });

  describe('query escaping', () => {
    beforeEach(() => {
      memoize.mockImplementation(jest.requireActual('../util/memoize').default);
    });

    it('should escape *', async () => {
      await asyncValidateField('username', '', mockValidator)('foo*');
      expect(mockValidator.GET).toHaveBeenCalledWith({ params: { query: '(username=="foo\\*")' } });
    });

    it('should escape ?', async () => {
      await asyncValidateField('barcode', '', mockValidator)('foo?');
      expect(mockValidator.GET).toHaveBeenCalledWith({ params: { query: '(barcode=="foo\\?")' } });
    });

    it('should escape ^', async () => {
      await asyncValidateField('username', '', mockValidator)('foo^');
      expect(mockValidator.GET).toHaveBeenCalledWith({ params: { query: '(username=="foo\\^")' } });
    });

    it('should escape "', async () => {
      await asyncValidateField('username', '', mockValidator)('foo"');
      expect(mockValidator.GET).toHaveBeenCalledWith({ params: { query: '(username=="foo\\"")' } });
    });

    it('should escape \\', async () => {
      await asyncValidateField('username', '', mockValidator)('foo\\');
      expect(mockValidator.GET).toHaveBeenCalledWith({ params: { query: '(username=="foo\\\\")' } });
    });
  });
});
