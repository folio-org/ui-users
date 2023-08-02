import { renderHook } from '@folio/jest-config-stripes/testing-library/react-hooks';

import {
  buildQueryByIds,
  batchRequest,
  buildQueryByUserIds,
} from './utils';

describe('buildQueryByIds', () => {
  it('should create query with id', async () => {
    const ids = ['1', '2'];
    const { result } = renderHook(() => buildQueryByIds(ids));

    expect(result.current).toBe('id==1 or id==2');
  });

  it('should return empty string', () => {
    const { result } = renderHook(() => buildQueryByIds([]));

    expect(result.current).toBeFalsy();
  });
});

describe('batchRequest', () => {
  const kyMock = jest.fn(() => ({
    get: () => ({
      json: () => Promise.resolve(['id1']),
    })
  }));


  it('should not call API if no query item passed', () => {
    batchRequest(kyMock, []);

    expect(buildQueryByUserIds([])).toBe('');
    expect(kyMock).not.toHaveBeenCalled();
  });

  it('should call API if some ids passed', () => {
    batchRequest(kyMock, ['id1']);

    expect(kyMock).toHaveBeenCalled();
  });

  it('should call API if some query objects and queryBuilder function are passed', () => {
    batchRequest(kyMock, [{ id: 'id1' }], buildQueryByIds);

    expect(kyMock).toHaveBeenCalled();
  });
});
