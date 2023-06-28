import React from 'react';
import { FormSpy } from 'react-final-form';

// A HOC which provides access to initial and current values from final form
const withFormValues = WrappedComponent => (props) => (
  <FormSpy>
    {
      ({ initialValues, values, form: { change } }) => (
        <WrappedComponent
          {...props}
          initialValues={initialValues}
          values={values}
          change={change}
        />
      )
    }
  </FormSpy>
);

export default withFormValues;
