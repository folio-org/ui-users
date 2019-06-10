import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
  intlShape,
} from 'react-intl';
import { AddressList } from '@folio/stripes/smart-components';
import { Select } from '@folio/stripes/components';
import { toAddressTypeOptions } from '../data/converters/address_type';

class UserAddresses extends React.Component {
  static propTypes = {
    addresses: PropTypes.arrayOf(PropTypes.object),
    addressTypes: PropTypes.arrayOf(PropTypes.object),
    onUpdate: PropTypes.func,
    expanded: PropTypes.bool,
    editable: PropTypes.bool,
    intl: intlShape.isRequired,
  };

  constructor(props) {
    super(props);
    this.onUpdate = this.onUpdate.bind(this);
    this.onDelete = this.onDelete.bind(this);

    this.addressList = null;
  }

  onDelete(addr) {
    this.removeAddress(addr);
    this.props.onUpdate(this.props.addresses);
  }

  onUpdate(addr) {
    this.addAddress(addr);
    this.props.onUpdate(this.props.addresses);
  }

  addAddress(addr) {
    const addresses = this.props.addresses;
    let index = 0;

    /* eslint-disable no-param-reassign */
    addr.id = addr.id || _.uniqueId();

    if (addresses.length) {
      index = _.findIndex(addresses, a => a.id === addr.id);
      if (index === -1) index = addresses.length;
    }

    addresses[index] = addr;
  }

  removeAddress(id) {
    const addresses = this.props.addresses;
    const index = _.findIndex(addresses, addr => addr.id === id);
    addresses.splice(index, 1);
  }

  render() {
    const {
      addresses,
      addressTypes,
      expanded,
      editable,
      intl,
    } = this.props;

    if (!addresses) return (<div />);

    const addressFields = {
      addressType: {
        component: Select,
        props: {
          dataOptions: toAddressTypeOptions(addressTypes),
          fullWidth: true,
          placeholder: intl.formatMessage({ id: 'ui-users.contact.selectAddressType' }),
        },
      },
    };

    return (<AddressList
      label={<FormattedMessage id="ui-users.contact.addresses" />}
      onUpdate={this.onUpdate}
      onCreate={this.onUpdate}
      onDelete={this.onDelete}
      fieldComponents={addressFields}
      addresses={addresses}
      expanded={expanded}
      canEdit={editable}
      canDelete={editable}
    />);
  }
}

export default injectIntl(UserAddresses);
