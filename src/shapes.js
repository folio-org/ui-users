import PropTypes from 'prop-types';

import { deliveryFulfillmentValues } from './constants';
import { nullOrStringIsRequiredTypeValidator } from './customTypeValidators';

const {
  HOLD_SHELF,
  DELIVERY,
} = deliveryFulfillmentValues;

export const addressTypesShape = PropTypes.arrayOf(PropTypes.shape({
  id: PropTypes.string.isRequired,
  addressType: PropTypes.string.isRequired,
}));

export const requestPreferencesShape = PropTypes.shape({
  holdShelf: PropTypes.bool,
  delivery: PropTypes.bool,
  defaultDeliveryAddressTypeId: nullOrStringIsRequiredTypeValidator,
  defaultServicePointId: PropTypes.string,
  fulfillment: PropTypes.oneOf([HOLD_SHELF, DELIVERY])
});

export const departmentsShape = PropTypes.arrayOf(PropTypes.shape({
  id: PropTypes.string.isRequired,
  code: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
}));

export const affiliationsShape = PropTypes.arrayOf(PropTypes.shape({
  id: PropTypes.string,
  isPrimary: PropTypes.bool,
  tenantId: PropTypes.string,
  tenantName: PropTypes.string,
  userId: PropTypes.string,
  username: PropTypes.string,
}));
