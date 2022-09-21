import validateMinDate from './validateMinDate';

describe('validateMinDate', () => {
  it('returns error for invalid date', () => {
    expect(validateMinDate('1890-01-01')).not.toBeNull();
  });

  it('returns null for valid date', () => {
    expect(validateMinDate('1990-01-01')).toBeNull();
  });
});
