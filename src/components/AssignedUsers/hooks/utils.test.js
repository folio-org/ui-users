import { buildQueryByIds } from '../../../utils';
import {
  batchRequest,
  buildQueryByUserIds,
} from './utils';

describe('batchRequest', () => {
  const kyMock = jest.fn(() => ({
    get: () => ({
      json: () => Promise.resolve(['id1']),
    }),
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
