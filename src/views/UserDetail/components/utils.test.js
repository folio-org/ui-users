import { shouldSuppress } from './utils';

describe('shouldSuppress', () => {
  describe('returns false', () => {
    test('returns false if records array is empty', async () => {
      expect(shouldSuppress({ records: [] }, '123')).toBe(false);
    });

    test('returns false if value is empty', async () => {
      expect(shouldSuppress({ records: [{ value: '' }] }, '123')).toBe(false);
    });

    test('if records array does not contain a match', async () => {
      expect(shouldSuppress({ records: [{ value: '["456"]' }] }, '123')).toBe(false);
    });

    test('if records does not contain an array', async () => {
      expect(shouldSuppress({ records: [{ value: '{"monkey": "bagel"}' }] }, '123')).toBe(false);
    });

    describe('logs error on invalid JSON', () => {
      beforeAll(() => {
        // eslint-disable-next-line no-console
        console.error = jest.fn();
      });
      afterAll(() => {
        // eslint-disable-next-line no-console
        console.error.mockRestore();
      });

      test('value is incorrectly serialized', () => {
        const list = { records: [{ value: '["123", 456"]' }] };
        const id = '123';

        const res = shouldSuppress(list, id);

        // eslint-disable-next-line no-console
        expect(console.error).toHaveBeenCalledTimes(1);

        expect(res).toBe(false);
      });
    });
  });

  describe('returns true', () => {
    test('if records array contains a match', async () => {
      expect(shouldSuppress({ records: [{ value: '["123", "456"]' }] }, '123')).toBe(true);
    });
  });
});
