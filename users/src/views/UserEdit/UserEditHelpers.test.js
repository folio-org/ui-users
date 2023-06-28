import { resourcesLoaded, showErrorCallout } from './UserEditHelpers';

describe('resourcesLoaded', () => {
  test('loaded, no exceptions', async () => {
    const res = {
      foo: { isPending: false },
      bar: { isPending: false },
    };

    expect(resourcesLoaded(res)).toBe(true);
  });

  test('loaded, with exceptions', async () => {
    const res = {
      foo: { isPending: false },
      bar: { isPending: true },
    };

    expect(resourcesLoaded(res, ['bar'])).toBe(true);
  });

  test('loaded (not an object)', async () => {
    const res = {
      foo: { isPending: false },
      bar: () => { },
    };

    expect(resourcesLoaded(res)).toBe(true);
  });

  test('unloaded (null)', async () => {
    const res = {
      foo: { isPending: false },
      bar: null,
    };

    expect(resourcesLoaded(res)).toBe(false);
  });

  test('unloaded (pending)', async () => {
    const res = {
      foo: { isPending: false },
      bar: { isPending: true },
    };

    expect(resourcesLoaded(res)).toBe(false);
  });
});

describe('showErrorCallout', () => {
  it('calls the callout', async () => {
    const res = {
      text: jest.fn().mockReturnValue(Promise.resolve()),
    };
    const sendCallout = jest.fn();

    await showErrorCallout(res, sendCallout);

    expect(sendCallout).toHaveBeenCalled();
  });
});
