import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { FormattedMessage } from 'react-intl';
import {
  Row,
  Col,
  Checkbox,
} from '@folio/stripes/components';
import { Field } from 'redux-form';
import { ConfigManager } from '@folio/stripes/smart-components';
import { withStripes } from '@folio/stripes/core';

class ChargedOutConditions extends Component {
  constructor(props) {
    super(props);

    this.configManager = props.stripes.connect(ConfigManager);
  }

  render() {
    return (
      <this.configManager
        label={<FormattedMessage id="ui-users.settings.feefine.balance" />}
      >
        <Row>
          <Col xs={12}>
            <Field
              component={Checkbox}
              type="checkbox"
              id="blockBorrowing"
              name="blockBorrowing"
              label={<FormattedMessage id="ui-users.settings.block.borrowing" />}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <Field
              component={Checkbox}
              type="checkbox"
              id="blockRenewals"
              name="blockRenewals"
              label={<FormattedMessage id="ui-users.settings.block.renew" />}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <Field
              component={Checkbox}
              type="checkbox"
              id="blockRequest"
              name="blockRequest"
              label={<FormattedMessage id="ui-users.settings.block.request" />}
            />
          </Col>
        </Row>

      </this.configManager>
    );
  }
}

ChargedOutConditions.propTypes = {
  stripes: PropTypes.shape({
    connect: PropTypes.func.isRequired,
  }).isRequired,
};

export default withStripes(ChargedOutConditions);
