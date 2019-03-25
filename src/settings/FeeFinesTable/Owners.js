import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Row,
  Col,
  Select,
} from '@folio/stripes/components';

const Owners = ({ dataOptions, onChange }) => {
  const options = [];
  const shared = dataOptions.find(d => d.owner === 'Shared') || {};

  if (shared.id) {
    options.push(
      <option
        value={shared.id}
        key="0"
      >
        {shared.owner}
      </option>
    );
  }

  if (dataOptions) {
    dataOptions.forEach((option) => {
      if (option.id !== shared.id) {
        options.push(
          <option
            value={option.id}
            key={option.id}
          >
            {option.owner}
          </option>
        );
      }
    });
  }

  return (
    <div>
      <Row>
        <Col xs>
          <span style={{ fontSize: 'large', fontWeight: '600' }}>
            <FormattedMessage id="ui-users.feefines.ownerLabel" />
          </span>
        </Col>
      </Row>
      <Row>
        <Col xs={5}>
          <Select
            onChange={onChange}
          >
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
