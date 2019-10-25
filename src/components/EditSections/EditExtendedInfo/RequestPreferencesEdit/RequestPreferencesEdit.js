import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import {
  Field,
  formValueSelector,
  change,
} from 'redux-form';
import {
  get,
  isEmpty,
  difference,
} from 'lodash';

import {
  Row,
  Col,
  Select,
  Checkbox,
} from '@folio/stripes/components';
import { deliveryFulfillmentValues } from '../../../../constants';
import { addressTypesShape } from '../../../../shapes';
import styles from './RequestPreferencesEdit.css';

class RequestPreferencesEdit extends Component {
  static propTypes = {
    deliveryAvailable: PropTypes.bool,
    servicePoints: PropTypes.arrayOf(PropTypes.object),
    addresses: PropTypes.arrayOf(PropTypes.shape({
      addressType: PropTypes.string.isRequired,
    })),
    addressTypes: addressTypesShape,
    setFieldValue: PropTypes.func.isRequired,
    intl: intlShape,
    defaultDeliveryAddressTypeId: PropTypes.oneOfType(
      PropTypes.string,
      PropTypes.oneOf([null]),
    ),
  };

  componentDidUpdate(prevProps) {
    const {
      addresses,
    } = this.props;

    if (this.areAddressTypesChanged(addresses, prevProps.addresses) && !this.isDefaultAddressTypeExists()) {
      this.resetDefaultDeliveryAddress();
    }
  }

  isDefaultAddressTypeExists(currentAddressTypeIds) {
    return currentAddressTypeIds.some(addressTypeId => addressTypeId === this.props.defaultDeliveryAddressTypeId);
  }

  areAddressTypesChanged(currentAddresses, prevAddresses) {
    const currentAddressTypeIds = currentAddresses.map(address => get(address, 'addressType'));
    const prevAddressTypeIds = prevAddresses.map(address => get(address, 'addressType'));

    if (currentAddresses === 0 && prevAddresses.length === 0) return false;

    return difference(prevAddressTypeIds, currentAddressTypeIds).length !== 0;
  }

  renderDefaultDeliveryAddressSelect() {
    return (
      <Field
        name="requestPreferences.defaultDeliveryAddressTypeId"
        label={<FormattedMessage id="ui-users.requests.defaultDeliveryAddress" />}
        dataOptions={this.getAddressOptions()}
        component={Select}
        validate={this.defaultDeliveryAddressValidator}
        placeholder={this.props.intl.formatMessage({ id: 'ui-users.requests.selectDeliveryAddress' })}
        required
      />
    );
  }

  renderServicePointSelect() {
    const { servicePoints, intl } = this.props;

    const options = servicePoints.map(servicePoint => ({
      value: servicePoint.id,
      label: servicePoint.name,
    }));

    const defaultOption = { value: '', label: intl.formatMessage({ id: 'ui-users.sp.selectServicePoint' }) };
    const resultOptions = [defaultOption, ...options];

    return (
      <Field
        name="requestPreferences.defaultServicePointId"
        label={<FormattedMessage id="ui-users.requests.defaultServicePoint" />}
        dataOptions={resultOptions}
        component={Select}
        parse={this.defaultServicePointFieldParser}
      />
    );
  }

  defaultServicePointFieldParser(value) {
    return value === '' ? null : value;
  }

  renderFulfilmentPreferenceSelect() {
    const { intl } = this.props;
    const options = [
      {
        value: deliveryFulfillmentValues.HOLD_SHELF,
        label: intl.formatMessage({ id: 'ui-users.requests.holdShelf' })
      },
      {
        value: deliveryFulfillmentValues.DELIVERY,
        label: intl.formatMessage({ id: 'ui-users.requests.delivery' })
      },
    ];

    return (
      <Field
        name="requestPreferences.fulfillment"
        label={<FormattedMessage id="ui-users.requests.fulfillmentPreference" />}
        dataOptions={options}
        component={Select}
      />
    );
  }

  getAddressOptions() {
    const {
      addresses,
      addressTypes,
    } = this.props;

    return addresses.reduce((options, address) => {
      const { addressType: addressTypeId } = address;
      const relatedAddressType = addressTypes
        .find((currentAddressType) => currentAddressType.id === addressTypeId);

      return [
        ...options,
        {
          value: get(relatedAddressType, 'id'),
          label: get(relatedAddressType, 'addressType'),
        }
      ];
    }, []);
  }

  defaultDeliveryAddressValidator = () => {
    return this.props.addresses.length === 0 ? <FormattedMessage id="ui-users.addAddressError" /> : null;
  }

  resetDefaultDeliveryAddress() {
    this.props.setFieldValue('requestPreferences.defaultDeliveryAddressTypeId', null);
  }

  onDeliveryCheckboxChange = (event) => {
    const { setFieldValue } = this.props;
    const fulfilmentValue = event.target.checked ? deliveryFulfillmentValues.HOLD_SHELF : null;

    setFieldValue('requestPreferences.fulfillment', fulfilmentValue);
    this.resetDefaultDeliveryAddress();
  }

  render() {
    const {
      deliveryAvailable,
    } = this.props;

    return (
      <Col xs={12} md={6}>
        <Row>
          <Col
            xs={12}
            md={6}
            className={styles.heading}
          >
            <FormattedMessage id="ui-users.requests.preferences" />
          </Col>
        </Row>
        <Row className={styles.heading}>
          <Col xs={12} md={6}>
            <Field
              name="requestPreferences.holdShelf"
              label={<FormattedMessage id="ui-users.requests.holdShelf" />}
              checked
              disabled
              component={Checkbox}
            />
          </Col>
          <Col xs={12} md={6}>
            <Field
              name="requestPreferences.delivery"
              label={<FormattedMessage id="ui-users.requests.delivery" />}
              checked={deliveryAvailable}
              component={Checkbox}
              onChange={this.onDeliveryCheckboxChange}
            />
          </Col>
        </Row>
        <Row className={styles.heading}>
          <Col xs={12} md={6}>
            {this.renderServicePointSelect()}
          </Col>
          <Col xs={12} md={6}>
            { deliveryAvailable && this.renderFulfilmentPreferenceSelect() }
          </Col>
        </Row>
        <Row className={styles.heading}>
          <Col mdOffset={6} xs={12} md={6}>
            { deliveryAvailable && this.renderDefaultDeliveryAddressSelect() }
          </Col>
        </Row>
      </Col>
    );
  }
}

const selectFormValue = formValueSelector('userForm');
const selectAddresses = (store) => {
  const addresses = selectFormValue(store, 'personal.addresses') || [];
  return addresses.filter(address => !isEmpty(address));
};
const selectServicePointsWithPickupLocation = store => get(store, 'okapi.currentUser.servicePoints', [])
  .filter(servicePoint => servicePoint.pickupLocation)
  .sort();

export default connect(
  store => ({
    addresses: selectAddresses(store),
    defaultDeliveryAddressTypeId: selectFormValue(store, 'requestPreferences.defaultDeliveryAddressTypeId'),
    deliveryAvailable: selectFormValue(store, 'requestPreferences.delivery'),
    servicePoints: selectServicePointsWithPickupLocation(store)
  }),
  dispatch => ({
    setFieldValue(fieldName, fieldValue) { dispatch(change('userForm', fieldName, fieldValue)); }
  }),
)(injectIntl(RequestPreferencesEdit));
