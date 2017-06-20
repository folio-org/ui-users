import React, { PropTypes } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';

import countries from '../../data/countries';
import css from './CountryAutocomplete.css';

const contriesOptions = countries.map(c => ({
  label: c.country,
  value: c.alpha2,
}));

const CountryAutocomplete = ({ label, input: { value, onChange } }) => {
  const selected = (value) ? [value] : [];

  return (
    <div className={css.root}>
      <label htmlFor={label} className={css.label}>{label}</label>
      <Typeahead
        name={label}
        bsSize="small"
        onInputChange={val => onChange(val)}
        selected={selected}
        className={css.autocomplete}
        clearButton options={contriesOptions}
      />
    </div>
  );
};

CountryAutocomplete.propTypes = {
  input: PropTypes.shape({
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
  }).isRequired,
  label: PropTypes.string.isRequired,
};

export default CountryAutocomplete;
