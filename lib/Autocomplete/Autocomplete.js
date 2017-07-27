import React from 'react';
import PropTypes from 'prop-types';
import { Typeahead } from 'react-bootstrap-typeahead';
import css from './Autocomplete.css';

function defaultFilterBy(option, text) {
  return option.label.toLowerCase().startsWith(text.toLowerCase());
}

const Autocomplete = ({ dataOptions, filterBy, label, input: { value, onChange } }) => {
  const selected = (value) ? [value] : [];
  const filter = filterBy || defaultFilterBy;

  return (
    <div className={css.root}>
      <label htmlFor={label} className={css.label}>{label}</label>
      <Typeahead
        clearButton
        name={label}
        bsSize="small"
        filterBy={filter}
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
  filterBy: PropTypes.func,
};

export default Autocomplete;
