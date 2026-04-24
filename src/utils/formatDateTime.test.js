import { formatDateTime } from './formatDateTime';

describe('formatDateTime', () => {
  const formatDate = jest.fn(() => '1/1/2024, 12:00 AM');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should format a date value using formatDate', () => {
    const result = formatDateTime('2024-01-01T00:00:00Z', formatDate);

    expect(result).toBe('1/1/2024, 12:00 AM');
    expect(formatDate).toHaveBeenCalledWith('2024-01-01T00:00:00Z', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  });

  it('should return null for a falsy value', () => {
    expect(formatDateTime(null, formatDate)).toBeNull();
    expect(formatDateTime(undefined, formatDate)).toBeNull();
    expect(formatDateTime('', formatDate)).toBeNull();
    expect(formatDate).not.toHaveBeenCalled();
  });
});
