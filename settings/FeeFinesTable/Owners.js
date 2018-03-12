import React from 'react';
import PropTypes from 'prop-types';
import Select from '@folio/stripes-components/lib/Select';

const Owners = (props) => {
  const options = [];
  const shared = props.dataOptions.find(d => d.desc === 'Shared') || {};
  options.push(<option value={shared.id} key="0">{shared.desc}</option>);
  if (props.dataOptions) {
    props.dataOptions.forEach((option) => {
      if (option.id !== shared.id)options.push(<option value={option.id} key={option.id}>{option.desc}</option>);
    });
  }

  return (
    <div>
      <Select style={{ marginLeft: '20px' }} onChange={props.onChange}>
        {options}
      </Select>
    </div>
  );
};

Owners.propTypes = {
  dataOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default Owners;
