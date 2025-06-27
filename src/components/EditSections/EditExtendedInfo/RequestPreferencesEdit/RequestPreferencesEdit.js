import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Field } from 'react-final-form';
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
  InfoPopover,
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
    defaultDeliveryAddressTypeId: nullOrStringIsRequiredTypeValidator,
    intl: PropTypes.object.isRequired,
    disabled: PropTypes.bool,
  }

  componentDidUpdate(prevProps) {
    if (this.isDefaultDeliveryAddressResetNeeded(prevProps.addresses, this.props.addresses)) {
      this.resetDefaultDeliveryAddress();
    }

    if (prevProps.deliveryAvailable !== this.props.deliveryAvailable) {
      this.onDeliveryCheckboxChange(this.props.deliveryAvailable);
    }
  }

  isDefaultDeliveryAddressResetNeeded(prevAddresses, currentAddresses) {
    const byAddressType = address => get(address, 'addressType');
    const prevAddressTypeIds = (prevAddresses ?? []).map(byAddressType);
    const currentAddressTypeIds = (currentAddresses ?? []).map(byAddressType);
    const addressTypesAreChanged = difference(prevAddressTypeIds, currentAddressTypeIds).length !== 0;

    const defaultAddressTypeNotExists = !currentAddressTypeIds
      .some(addressTypeId => addressTypeId === this.props.defaultDeliveryAddressTypeId);

    return addressTypesAreChanged && defaultAddressTypeNotExists;
  }

  renderDefaultDeliveryAddressSelect() {
    const { deliveryAvailable } = this.props;

    return (
      <div data-test-default-delivery-address-field>
        <Field
          name="requestPreferences.defaultDeliveryAddressTypeId"
          label={<FormattedMessage id="ui-users.requests.defaultDeliveryAddress" />}
          dataOptions={this.getAddressOptions()}
          component={Select}
          validate={this.defaultDeliveryAddressValidator}
          placeholder={this.props.intl.formatMessage({ id: 'ui-users.requests.selectDeliveryAddress' })}
          required
          disabled={!deliveryAvailable}
        />
      </div>
    );
  }

  renderServicePointSelect() {
    const { servicePoints, intl, disabled } = this.props;

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
        disabled={disabled}
        parse={this.defaultServicePointFieldParser}
      />
    );
  }

  defaultServicePointFieldParser(value) {
    return value === '' ? null : value;
  }

  renderFulfillmentPreferenceSelect() {
    const {
      intl,
      deliveryAvailable,
    } = this.props;

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

    const label = (
      <>
        <FormattedMessage id="ui-users.requests.fulfillmentPreference" />
        <InfoPopover
          iconSize="medium"
          buttonProps={{
            innerClassName: styles.infoPopoverButton,
          }}
          content={<FormattedMessage id="ui-users.requests.fulfillmentPreference.info" />}
        />
      </>
    );

    return (
      <Field
        data-test-fulfillment-preference
        name="requestPreferences.fulfillment"
        label={label}
        dataOptions={options}
        component={Select}
        disabled={!deliveryAvailable}
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

  defaultDeliveryAddressValidator = (value, formData) => {
    const { deliveryAvailable } = this.props;

    if (!deliveryAvailable) return undefined;

    const nonEmptyAddresses = get(formData, 'personal.addresses', []).filter(address => !isEmpty(address));

    if (nonEmptyAddresses.length === 0) {
      return <FormattedMessage id="ui-users.addAddressError" />;
    }

    if (!value) {
      return <FormattedMessage id="ui-users.errors.missingRequiredField" />;
    }

    return undefined;
  }

  resetDefaultDeliveryAddress() {
    this.props.setFieldValue('requestPreferences.defaultDeliveryAddressTypeId', null);
  }

  onDeliveryCheckboxChange = (deliveryAvailable) => {
    const { setFieldValue } = this.props;
    const fulfillmentValue = deliveryAvailable ? deliveryFulfillmentValues.HOLD_SHELF : null;

    setFieldValue('requestPreferences.fulfillment', fulfillmentValue);
    this.resetDefaultDeliveryAddress();
  }

  render() {
    const {
      disabled,
    } = this.props;

    return (
      <Row>
        <Col
          xs={12}
          md={3}
        >
          <fieldset className={styles.preferencesFieldset}>
            <Label tagName="legend">
              <FormattedMessage id="ui-users.requests.preferences" />
            </Label>
            <Row>
              <Col xs={12} md={6}>
                <Field
                  data-test-hold-shelf-checkbox
                  name="requestPreferences.holdShelf"
                  label={<FormattedMessage id="ui-users.requests.holdShelf" />}
                  checked
                  disabled
                  component={Checkbox}
                  type="checkbox"
                />
              </Col>
              <Col xs={12} md={6}>
                <Field
                  data-test-delivery-checkbox
                  name="requestPreferences.delivery"
                  label={<FormattedMessage id="ui-users.requests.delivery" />}
                  component={Checkbox}
                  type="checkbox"
                  disabled={disabled}
                />
              </Col>
            </Row>
          </fieldset>
        </Col>
        <Col xs={12} md={3}>
          {this.renderServicePointSelect()}
        </Col>
        <Col xs={12} md={3}>
          {this.renderFulfillmentPreferenceSelect()}
        </Col>
        <Col xs={12} md={3}>
          {this.renderDefaultDeliveryAddressSelect()}
        </Col>
      </Row>
    );
  }
}

const selectServicePointsWithPickupLocation = fp.pipe([
  fp.getOr([], 'folio_users_service_points.records'),
  fp.filter(servicePoint => servicePoint.pickupLocation),
  fp.uniqBy('id'),
  fp.sortBy('name'),
]);

export default connect(
  store => ({
    servicePoints: selectServicePointsWithPickupLocation(store),
  }),
)(injectIntl(RequestPreferencesEdit));


