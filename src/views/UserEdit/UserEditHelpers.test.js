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
  let res = {
    text: jest.fn().mockReturnValue(Promise.resolve('')),
    headers: {
      get: jest.fn().mockReturnValue('text/html'),
    }
  };
  const sendCallout = jest.fn();

  it('calls the callout with generic error', async () => {
    await showErrorCallout({}, sendCallout);

    expect(sendCallout).toHaveBeenCalled();

    const callArgs = sendCallout.mock.calls[0][0];
    const callArgsJSON = JSON.stringify(callArgs, null, 2);

    expect(callArgsJSON).toContain('"id": "ui-users.errors.generic"');
  });

  it('calls the error callout with username exist as text', async () => {
    res = {
      ...res,
      text: jest.fn().mockReturnValue(Promise.resolve('username already exists')),
    };

    await showErrorCallout(res, sendCallout);

    expect(sendCallout).toHaveBeenCalledWith(expect.objectContaining({
      type: 'error',
    }));
  });

  it('calls the error callout with username exist as json', async () => {
    res = {
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
      },
      json: jest.fn().mockReturnValue(Promise.resolve({ errors: [{ message: 'username already exists' }, { message: 'username already exists with duplicate' }] })),
    };

    await showErrorCallout(res, sendCallout);

    expect(sendCallout).toHaveBeenCalledWith(expect.objectContaining({
      type: 'error',
    }));
  });
});
