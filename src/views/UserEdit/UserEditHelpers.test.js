import { resourcesLoaded, showErrorCallout } from './UserEditHelpers';

describe('resourcesLoaded', () => {
  it('loaded, no exceptions', async () => {
    const res = {
      foo: { isPending: false },
      bar: { isPending: false },
    };

    expect(resourcesLoaded(res)).toBe(true);
  });

  it('loaded, with exceptions', async () => {
    const res = {
      foo: { isPending: false },
      bar: { isPending: true },
    };

    expect(resourcesLoaded(res, ['bar'])).toBe(true);
  });

  it('loaded (not an object)', async () => {
    const res = {
      foo: { isPending: false },
      bar: () => { },
    };

    expect(resourcesLoaded(res)).toBe(true);
  });

  it('unloaded (null)', async () => {
    const res = {
      foo: { isPending: false },
      bar: null,
    };

    expect(resourcesLoaded(res)).toBe(false);
  });

  it('unloaded (pending)', async () => {
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
      text: jest.fn().mockReturnValue(Promise.resolve('')),
    };
    const sendCallout = jest.fn();

    await showErrorCallout(res, sendCallout);

    expect(sendCallout).toHaveBeenCalled();
  });

  it('calls the error callout with username exist', async () => {
    const res = {
      text: jest.fn().mockReturnValue(Promise.resolve('username already exists')),
    };
    const sendCallout = jest.fn();

    await showErrorCallout(res, sendCallout);

    expect(sendCallout).toHaveBeenCalledWith(expect.objectContaining({
      type: 'error',
    }));
  });
});
