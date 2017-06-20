import React, { PropTypes } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';

import countries from '../../data/countries';
import css from './CountryAutocomplete.css';

const contriesData = countries.map(c => ({
  label: c.country,
  value: c.alpha2,
}));

const CountryAutocomplete = ({ label, input: { value } }) => {
  const selected = (value) ? [value] : [];
  return (
    <div className={css.root}>
      <label htmlFor={this.props.id} className={css.label}>{this.props.label}</label>
      <Typeahead selected={selected} className={css.autocomplete} bsSize="small" clearButton options={contriesData} />
    </div>
  );
};

CountryAutocomplete.propTypes = {
  input: PropTypes.shape({
    value: PropTypes.string.isRequired,
  }).isRequired,
  label: PropTypes.string.isRequired,
};

export default CountryAutocomplete;
