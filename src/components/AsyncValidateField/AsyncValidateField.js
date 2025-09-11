import { useMemo } from 'react';
import { Field } from 'react-final-form';
import debounce from 'lodash/debounce';

import memoize from '../util/memoize';
 
export const AsyncValidateField = ({
  validate,
  children,
  wait = 300,
  ...props
}) => {
  const asyncValidate = useMemo(() => memoize(debounce(validate, wait)), [validate, wait]);

  return (
    <Field
      {...props}
      validate={asyncValidate}
    >
      {children}
    </Field>
  );
};
