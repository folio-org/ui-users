import React from 'react';
import PropTypes from 'prop-types';

export const FormContext = React.createContext({});

export const useFormContext = () => React.useContext(FormContext);

export const Form = ({ autoFocusField, ...props }) => (
  <FormContext.Provider value={{ autoFocusField }}>
    <form {...props} />
  </FormContext.Provider>
);

Form.propTypes = {
  autoFocusField: PropTypes.string,
};
