import React from 'react';
import PropTypes from 'prop-types';
import Select from '@folio/stripes-components/lib/Select';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';

const Owners = (props) => {
  const options = [];
  const shared = props.dataOptions.find(d => d.owner === 'Shared') || {};
  if (shared.id) options.push(<option value={shared.id} key="0">{shared.owner}</option>);
  if (props.dataOptions) {
    props.dataOptions.forEach((option) => {
      if (option.id !== shared.id)options.push(<option value={option.id} key={option.id}>{option.owner}</option>);
    });
  }

  return (
    <div>
      <Row>
        <Col>
          <span style={{ fontSize: 'large', fontWeight: '600', marginLeft: '8px' }}>
            Fee/Fine Owner
          </span>
        </Col>
        <Col>
          <Select style={{ marginLeft: '20px' }} onChange={props.onChange}>
            {options}
          </Select>
        </Col>
      </Row>
    </div>
  );
};

Owners.propTypes = {
  dataOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default Owners;
