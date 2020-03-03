import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Col,
  KeyValue,
  Row,
} from '@folio/stripes/components';

import { requestPreferencesShape } from '../../../../../shapes';

import styles from './RequestPreferencesView.css';

class RequestPreferencesView extends Component {
  static propTypes = {
    requestPreferences: requestPreferencesShape,
    defaultServicePointName: PropTypes.string,
    defaultDeliveryAddressTypeName: PropTypes.string.isRequired,
  };

  getHoldShelfStateTranslationKey() {
    return this.props.requestPreferences.holdShelf
      ? 'ui-users.requests.holdShelfYes'
      : 'ui-users.requests.holdShelfNo';
  }

  getDeliveryStateTranslationKey() {
    return this.props.requestPreferences.delivery
      ? 'ui-users.requests.deliveryYes'
      : 'ui-users.requests.deliveryNo';
  }

  render() {
    const {
      requestPreferences,
      defaultServicePointName,
      defaultDeliveryAddressTypeName,
    } = this.props;

    return (
      <>
        <Row>
          <Col xs={4}>
            <span className={styles.heading}>
              <FormattedMessage id="ui-users.requests.preferences" />
            </span>
          </Col>
        </Row>
        <Row className={styles['request-preferences-row']}>
          <Col xs={4} data-test-hold-shelf>
            <FormattedMessage id={this.getHoldShelfStateTranslationKey()} />
          </Col>
          <Col xs={4} data-test-delivery>
            <FormattedMessage id={this.getDeliveryStateTranslationKey()} />
          </Col>
        </Row>
        <Row>
          <Col xs={4}>
            {requestPreferences.holdShelf && (
              <KeyValue label={<FormattedMessage id="ui-users.requests.defaultPickupServicePoint" />}>
                <span data-test-default-pickup-service-point>
                  { defaultServicePointName || '-' }
                </span>
              </KeyValue>
            )}
          </Col>
          <Col xs={4}>
            {requestPreferences.delivery && (
              <KeyValue label={<FormattedMessage id="ui-users.requests.fulfillmentPreference" />}>
                <span data-test-fulfillment-preference>
                  { requestPreferences.fulfillment }
                </span>
              </KeyValue>
            )}
          </Col>
        </Row>
        <Row>
          <Col xsOffset={4} xs={8}>
            {requestPreferences.delivery && (
              <KeyValue label={<FormattedMessage id="ui-users.requests.defaultDeliveryAddress" />}>
                <span data-test-default-delivery-address>
                  { defaultDeliveryAddressTypeName || '-'}
                </span>
              </KeyValue>
            )}
          </Col>
        </Row>
      </>
    );
  }
}

export default RequestPreferencesView;
