import { useContext } from 'react';

import { CalloutContext } from '@folio/stripes/core';

/**
 * useErrorCallout
 * Return a function, sendErrorCallout(message), that opens a non-expiring
 * error callout with the given message. message can be a simple string
 * or an HTTP response, i.e. a resolved Promise from a fetch, which is
 * what react-query hands to `onError` if the query returns non-ok.
 *
 * @returns func
 */
const useErrorCallout = () => {
  const callout = useContext(CalloutContext);

  return {
    sendErrorCallout: (message) => {
      // message can be a simple string, or we can dig it out from an HTTP response
      // shaped like { errors: [{ message, type, code }] }
      if (typeof message === 'string') {
        callout.sendCallout({ type: 'error', message, timeout: 0 });
        return;
      } else if (typeof message === 'object') {
        const promise = message?.response?.json();
        if (promise) {
          promise.then((json) => {
            json.errors.forEach(i => {
              callout.sendCallout({ type: 'error', message: i.message, timeout: 0 });
            });
          });
          return;
        }
      }

      // we dunno how to handle this message so we're just gonna log it
      console.error(message); // eslint-disable-line no-console
    }
  };
};

export default useErrorCallout;
