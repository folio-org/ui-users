import validateBirthdate from './validateBirthdate';

describe('validateBirthdate', () => {
  it('returns error for invalid date', () => {
    expect(validateBirthdate('1890-01-01')).not.toBeNull();
  });

  it('returns null for valid date', () => {
    expect(validateBirthdate('1990-01-01')).toBeNull();
  });
});
