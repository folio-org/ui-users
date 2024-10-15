import { renderHook, act } from '@folio/jest-config-stripes/testing-library/react';
import { CalloutContext } from '@folio/stripes/core';

import useErrorCallout from './useErrorCallout';

const sendCallout = jest.fn();

const wrapper = ({ children }) => (
  <CalloutContext.Provider value={{ sendCallout }}>
    {children}
  </CalloutContext.Provider>
);

describe('useErrorCallout', () => {
  it('handles a string message', async () => {
    const message = 'some message';
    const { result } = renderHook(
      () => useErrorCallout(),
      { wrapper },
    );

    await act(async () => { result.current.sendErrorCallout(message); });

    expect(sendCallout).toHaveBeenCalledWith(expect.objectContaining({
      type: 'error',
      timeout: 0,
      message
    }));
  });

  it('handles an http response message', async () => {
    const message = 'some message';
    const error = {
      response: {
        json: () => Promise.resolve({ errors: [{ message }] }),
      }
    };
    const { result } = renderHook(
      () => useErrorCallout(),
      { wrapper },
    );

    await act(async () => { result.current.sendErrorCallout(error); });

    expect(sendCallout).toHaveBeenCalledWith(expect.objectContaining({
      type: 'error',
      timeout: 0,
      message
    }));
  });

  it('logs an unknown message', async () => {
    const spy = jest.spyOn(window.console, 'error');

    const message = { funky: 'chicken' };
    const { result } = renderHook(
      () => useErrorCallout(),
      { wrapper },
    );

    await act(async () => { result.current.sendErrorCallout(message); });

    expect(spy).toHaveBeenCalledWith(message);
  });
});
