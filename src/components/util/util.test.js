import '../../../test/jest/__mock__';
import { checkUserActive } from './util';

describe('checkUserActive', () => {
  it('returns true for active users', () => {
    const user = {
      active: true,
      expirationDate: new Date(),
    };

    expect(checkUserActive(user)).toBe(true);
  });

  it('returns false for inactive users', () => {
    const user = {
      active: false,
      expirationDate: new Date(),
    };

    expect(checkUserActive(user)).toBe(false);
  });

  it('returns false for expired users', () => {
    const expDate = new Date();
    const user = {
      active: true,
      expirationDate: expDate.setDate(expDate.getDate() - 1),
    };

    expect(checkUserActive(user)).toBe(false);
  });
});
