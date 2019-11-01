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

import fp from 'lodash/fp';

import {
  Row,
  Col,
  Select,
  Checkbox,
  Label,
} from '@folio/stripes/components';

import { deliveryFulfillmentValues } from '../../../../constants';
import { addressTypesShape } from '../../../../shapes';
import { nullOrStringIsRequiredTypeValidator } from '../../../../customTypeValidators';
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
    defaultDeliveryAddressTypeId: nullOrStringIsRequiredTypeValidator,
  }

  componentDidUpdate(prevProps) {
    if (this.isDefaultDeliveryAddressResetNeeded(prevProps.addresses, this.props.addresses)) {
      this.resetDefaultDeliveryAddress();
    }
  }

  isDefaultDeliveryAddressResetNeeded(prevAddresses, currentAddresses) {
    const byAddressType = address => get(address, 'addressType');
    const prevAddressTypeIds = prevAddresses.map(byAddressType);
    const currentAddressTypeIds = currentAddresses.map(byAddressType);
    const addressTypesAreChanged = difference(prevAddressTypeIds, currentAddressTypeIds).length !== 0;

    const defaultAddressTypeNotExists = !currentAddressTypeIds
      .some(addressTypeId => addressTypeId === this.props.defaultDeliveryAddressTypeId);

    return addressTypesAreChanged && defaultAddressTypeNotExists;
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
        label={<FormattedMessage id="ui-users.requests.defaultPickupServicePoint" />}
        dataOptions={resultOptions}
        component={Select}
        parse={this.defaultServicePointFieldParser}
      />
    );
  }

  defaultServicePointFieldParser(value) {
    return value === '' ? null : value;
  }

  renderFulfillmentPreferenceSelect() {
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

  // eslint-disable-next-line consistent-return
  defaultDeliveryAddressValidator = (value, formData) => {
    const nonEmptyAddresses = get(formData, 'personal.addresses', []).filter(address => !isEmpty(address));

    if (nonEmptyAddresses.length === 0) {
      return <FormattedMessage id="ui-users.addAddressError" />;
    }

    if (!value) {
      return <FormattedMessage id="ui-users.errors.missingRequiredField" />;
    }
  }

  resetDefaultDeliveryAddress() {
    this.props.setFieldValue('requestPreferences.defaultDeliveryAddressTypeId', null);
  }

  onDeliveryCheckboxChange = (event) => {
    const { setFieldValue } = this.props;
    const fulfillmentValue = event.target.checked ? deliveryFulfillmentValues.HOLD_SHELF : null;

    setFieldValue('requestPreferences.fulfillment', fulfillmentValue);
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
          >
            <Label tagName="div">
              <span className={styles.heading}>
                <FormattedMessage id="ui-users.requests.preferences" />
              </span>
            </Label>
          </Col>
        </Row>
        <Row className={styles.rowMargin}>
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
        <Row>
          <Col xs={12} md={6}>
            {this.renderServicePointSelect()}
          </Col>
          <Col xs={12} md={6}>
            { deliveryAvailable && this.renderFulfillmentPreferenceSelect() }
          </Col>
        </Row>
        <Row>
          <Col mdOffset={6} xs={12} md={6}>
            { deliveryAvailable && this.renderDefaultDeliveryAddressSelect() }
          </Col>
        </Row>
      </Col>
    );
  }
}

const selectFormValue = formValueSelector('userForm');
const selectNonEmptyAddresses = fp.pipe([
  store => selectFormValue(store, 'personal.addresses') || [],
  fp.filter(address => !isEmpty(address)),
]);
const selectServicePointsWithPickupLocation = fp.pipe([
  fp.getOr([], 'folio_users_service_points.records'),
  fp.filter(servicePoint => servicePoint.pickupLocation),
  fp.sortBy('name'),
]);

export default connect(
  store => ({
    addresses: selectNonEmptyAddresses(store),
    defaultDeliveryAddressTypeId: selectFormValue(store, 'requestPreferences.defaultDeliveryAddressTypeId'),
    deliveryAvailable: selectFormValue(store, 'requestPreferences.delivery'),
    servicePoints: selectServicePointsWithPickupLocation(store)
  }),
  dispatch => ({
    setFieldValue(fieldName, fieldValue) { dispatch(change('userForm', fieldName, fieldValue)); }
  }),
)(injectIntl(RequestPreferencesEdit));
