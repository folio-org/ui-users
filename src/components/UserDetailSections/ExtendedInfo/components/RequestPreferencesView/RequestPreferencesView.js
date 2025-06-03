import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Checkbox,
  Col,
  KeyValue,
  Row,
} from '@folio/stripes/components';

import { requestPreferencesShape } from '../../../../../shapes';

class RequestPreferencesView extends Component {
  static propTypes = {
    requestPreferences: requestPreferencesShape,
    defaultServicePointName: PropTypes.string,
    defaultDeliveryAddressTypeName: PropTypes.string.isRequired,
  };

  render() {
    const {
      requestPreferences,
      defaultServicePointName,
      defaultDeliveryAddressTypeName,
    } = this.props;

    return (
      <>
        <Row>
          <Col xs={12} md={3}>
            <KeyValue label={<FormattedMessage id="ui-users.requests.preferences" />}>
              <>
                <Checkbox
                  label={<FormattedMessage id="ui-users.requests.holdShelf" />}
                  checked={requestPreferences.holdShelf}
                  disabled
                />
                <Checkbox
                  label={<FormattedMessage id="ui-users.requests.delivery" />}
                  checked={requestPreferences.delivery}
                  disabled
                />
              </>
            </KeyValue>
          </Col>
          <Col xs={12} md={3}>
            <KeyValue label={<FormattedMessage id="ui-users.requests.defaultPickupServicePoint" />}>
              {defaultServicePointName}
            </KeyValue>
          </Col>
          <Col xs={12} md={3}>
            <KeyValue label={<FormattedMessage id="ui-users.requests.fulfillmentPreference" />}>
              {requestPreferences.fulfillment}
            </KeyValue>
          </Col>
          <Col xs={12} md={3}>
            <KeyValue label={<FormattedMessage id="ui-users.requests.defaultDeliveryAddress" />}>
              {defaultDeliveryAddressTypeName}
            </KeyValue>
          </Col>
        </Row>
      </>
    );
  }
}

export default RequestPreferencesView;
