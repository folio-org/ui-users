import { useEffect, useMemo, useRef } from 'react';
import { Field } from 'react-final-form';
import debounce from 'lodash/debounce';

import memoize from '../util/memoize';

export const AsyncValidateField = ({
  validate,
  children,
  wait = 300,
  // Async validation hits the server, so by default this field should only be
  // revalidated when its own value changes, not whenever any other field changes.
  // Consumers can still override this by explicitly passing their own `validateFields`.
  validateFields = [],
  ...props
}) => {
  // `validateFields` only controls cascading validation triggered by *this* field's
  // own changes - it does NOT stop this field from being revalidated when an
  // unrelated field changes (final-form falls back to validating every field
  // whenever a field with no `validateFields` setting changes). `memoize` guards
  // against that: it skips calling `debounce`/`validate` again (and thus avoids
  // firing another server request) when this field's own value hasn't changed.
  //
  // `pendingResolve` tracks the resolver of the most recent (not-yet-settled) Promise.
  // final-form waits for every Promise it's ever given before considering the form
  // done validating, but `lodash/debounce` only invokes its wrapped function once
  // per burst (the trailing call) - so without resolving the previous Promise first,
  // every superseded keystroke would leave its Promise dangling forever, permanently
  // blocking submission (e.g. "Save & close").
  const pendingResolve = useRef();

  const debouncedValidate = useMemo(() => debounce((value, allValues, meta, resolve) => {
    resolve(validate(value, allValues, meta));
  }, wait), [validate, wait]);

  // If the field unmounts (e.g. it's conditionally rendered) while its own debounce
  // timer is still pending, the surrounding <Form> may still be mounted - so cancel
  // the timer and resolve the dangling Promise instead of leaving it hanging.
  useEffect(() => () => {
    debouncedValidate.cancel();
    pendingResolve.current?.();
  }, [debouncedValidate]);

  const asyncValidate = useMemo(() => memoize((value, allValues, meta) => new Promise((resolve) => {
    pendingResolve.current?.();
    pendingResolve.current = resolve;
    debouncedValidate(value, allValues, meta, resolve);
  })), [debouncedValidate]);

  return (
    <Field
      {...props}
      validate={asyncValidate}
      validateFields={validateFields}
    >
      {children}
    </Field>
  );
};
