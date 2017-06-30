// eslint-disable-next-line import/no-unresolved
import React from 'react';
import PropTypes from 'prop-types';
import { Typeahead } from 'react-bootstrap-typeahead';
import css from './Autocomplete.css';

const Autocomplete = ({ dataOptions, label, input: { value, onChange } }) => {
  const selected = (value) ? [value] : [];

  return (
    <div className={css.root}>
      <label htmlFor={label} className={css.label}>{label}</label>
      <Typeahead
        clearButton
        name={label}
        bsSize="small"
        onInputChange={val => onChange(val)}
        selected={selected}
        className={css.autocomplete}
        options={dataOptions}
      />
    </div>
  );
};

Autocomplete.propTypes = {
  input: PropTypes.shape({
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
  }).isRequired,
  label: PropTypes.string.isRequired,
  dataOptions: PropTypes.arrayOf(PropTypes.object),
};

export default Autocomplete;
