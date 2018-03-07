import React from 'react';
import PropTypes from 'prop-types';
import { Typeahead } from 'react-bootstrap-typeahead';
import TetherComponent from 'react-tether'; // eslint-disable-line  import/no-extraneous-dependencies
import css from './Autocomplete.css';

function defaultFilterBy(option, text) {
  return option.label.toLowerCase().startsWith(text.toLowerCase());
}

const Autocomplete = ({ dataOptions, tether, filterBy, label, input: { value, onChange } }) => {
  const selected = (value) ? [value] : [];
  const filter = filterBy || defaultFilterBy;
  const mergedTetherProps = Object.assign({}, Autocomplete.defaultProps.tether, tether);

  return (
    <TetherComponent {...mergedTetherProps}>
      <label htmlFor={label} className={css.label}>{label}</label>
      <div className={css.root}>
        <Typeahead
          clearButton
          inputProps={{ name: label }}
          bsSize="small"
          filterBy={filter}
          onInputChange={val => onChange(val)}
          selected={selected}
          className={css.autocomplete}
          options={dataOptions}
        />
      </div>

    </TetherComponent>
  );
};

Autocomplete.defaultProps = {
  tether: {
    attachment: 'top left',
    renderElementTo: null,
    targetAttachment: 'bottom left',
    optimizations: {
      gpu: false,
    },
  },
};

Autocomplete.propTypes = {
  input: PropTypes.shape({
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
  }).isRequired,
  label: PropTypes.string.isRequired,
  dataOptions: PropTypes.arrayOf(PropTypes.object),
  filterBy: PropTypes.func,
  tether: PropTypes.object,
};

export default Autocomplete;
