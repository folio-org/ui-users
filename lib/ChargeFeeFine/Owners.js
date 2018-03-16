import React from 'react';
import Select from '@folio/stripes-components/lib/Select';
import PropTypes from 'prop-types';

const Owners = (props) => {
  const options = [];
  if (props.placeholder) {
    options.push(<option value="*" key="x">{props.placeholder}</option>);
  }
  if (props.dataOptions) {
    props.dataOptions.forEach((option) => {
      options.push(<option value={option.id} key={option.id}>{option.desc}</option>);
    });
  }

  return (
    <Select onChange={props.onChange}>
      {options}
    </Select>
  );
};

Owners.propTypes = {
  placeholder: PropTypes.String,
  dataOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default Owners;
