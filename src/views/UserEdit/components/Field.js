import React from 'react';
import { Field as ReduxFormField } from 'redux-form';

import { useFormContext } from './Form';

export const Field = props => {
  const { autoFocusField } = useFormContext();

  const componentProps = props?.props;

  // we can override autoFocus, setting it explicitly to true or false
  const autoFocus = componentProps?.autoFocus ?? (autoFocusField === props?.name);

  return (
    <ReduxFormField
      {...props}
      props={{ ...componentProps, autoFocus }}
    />
  );
};

Field.propTypes = ReduxFormField.propTypes;

export default Field;
