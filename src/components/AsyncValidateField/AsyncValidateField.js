import { useMemo } from 'react';
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
  // `debounce` on its own can't be used as the field-level `validate` function:
  // since it only invokes `validate` on the trailing edge, calling the debounced
  // function returns `undefined` synchronously instead of a Promise. final-form
  // relies on the return value being a Promise to know the validation is async
  // and to wait for it, so with a plain debounce the eventual (delayed) result
  // is simply discarded and no error is ever shown. Wrapping it in a `Promise`
  // that is resolved by the debounced call fixes this: every invocation now
  // returns a real Promise that final-form can await.
  const debouncedValidate = useMemo(() => debounce((value, resolve) => {
    resolve(validate(value));
  }, wait), [validate, wait]);

  const asyncValidate = useMemo(() => memoize((value) => new Promise((resolve) => {
    debouncedValidate(value, resolve);
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
