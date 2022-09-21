import validateMinDate from './validateMinDate';

const validateBirthDate = validateMinDate('ui-users.errors.personal.dateOfBirth');

describe('validateMinDate', () => {
  it('returns error for invalid date', () => {
    expect(validateBirthDate('1890-01-01')).not.toBeNull();
  });

  it('returns null for valid date', () => {
    expect(validateBirthDate('1990-01-01')).toBeNull();
  });
});
