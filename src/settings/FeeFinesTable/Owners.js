import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';

import {
  Row,
  Col,
  Select,
  Headline,
} from '@folio/stripes/components';

import { SHARED_OWNER } from '../../constants';

const Owners = ({ dataOptions, onChange, filterShared }) => {
  const { formatMessage } = useIntl();
  const options = [];
  const shared = dataOptions.find(d => d.owner === SHARED_OWNER) || {};

  if (shared.id && filterShared === false) {
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
          <Headline size="large" weight="medium">
            <FormattedMessage id="ui-users.owners.singular" />
          </Headline>
        </Col>
      </Row>
      <Row>
        <Col xs={5}>
          <Select
            id="select-owner"
            onChange={onChange}
            aria-label={formatMessage({ id: 'ui-users.owners.select' })}
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
  filterShared: PropTypes.bool,
};

export default Owners;
