import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Field } from 'react-final-form';

import memoize from '../util/memoize';

// Debounces `validate`, ensuring every Promise returned to final-form eventually
// settles - even one belonging to an earlier, superseded call - since final-form
// waits for all of them before considering the form done validating (see
// `AsyncValidateField` below for the full explanation).
const useDebouncedValidate = (validate, wait) => {
  const timeoutRef = useRef(null);
  const pendingResolve = useRef();

  useEffect(() => () => {
    clearTimeout(timeoutRef.current);
    pendingResolve.current?.();
  }, []);

  const scheduleValidate = useCallback((value, allValues, meta, resolve) => {
    pendingResolve.current?.();
    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      resolve(validate(value, allValues, meta));
    }, wait);

    pendingResolve.current = resolve;
  }, [validate, wait]);

  return useMemo(() => memoize((value, allValues, meta) => new Promise((resolve) => {
    scheduleValidate(value, allValues, meta, resolve);
  })), [scheduleValidate]);
};

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
  // against that: it skips calling `validate` again (and thus avoids firing another
  // server request) when this field's own value hasn't changed.
  const asyncValidate = useDebouncedValidate(validate, wait);

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
