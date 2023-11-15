import { DCB_USER } from './constants';
import { isAVirtualPatron } from './utils';

describe('utils', () => {
  describe('isAVirtualPtron', () => {
    it('should return true if user is virtual patron i.e., user last name is "DcbSystem', () => {
      expect(isAVirtualPatron(DCB_USER.lastName)).toBe(true);
    });

    it('should return false if user is not a virtual patron i.e., user last name is not "DcbSystem', () => {
      expect(isAVirtualPatron('test')).toBe(false);
    });
  });
});
