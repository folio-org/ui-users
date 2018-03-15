import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import AddressList from '@folio/stripes-components/lib/structures/AddressFieldGroup/AddressList';
import Select from '@folio/stripes-components/lib/Select';
import { toAddressTypeOptions } from '../../converters/address_type';

class UserAddresses extends React.Component {
  static propTypes = {
    addresses: PropTypes.arrayOf(PropTypes.object),
    addressTypes: PropTypes.arrayOf(PropTypes.object),
    onUpdate: PropTypes.func,
    expanded: PropTypes.bool,
    editable: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.onUpdate = this.onUpdate.bind(this);
    this.onDelete = this.onDelete.bind(this);

    this.addressList = null;
  }

  onUpdate(addr) {
    this.addAddress(addr);
    this.props.onUpdate(this.props.addresses);
  }

  onDelete(addr) {
    this.removeAddress(addr);
    this.props.onUpdate(this.props.addresses);
  }

  removeAddress(id) {
    const addresses = this.props.addresses;
    const index = _.findIndex(addresses, addr => addr.id === id);
    addresses.splice(index, 1);
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

  render() {
    const { addresses, addressTypes } = this.props;

    if (!addresses) return (<div />);

    const addressFields = {
      addressType: { component: Select, props: { dataOptions: toAddressTypeOptions(addressTypes), fullWidth: true, placeholder: 'Select address type' } },
    };

    return (<AddressList
      label="Addresses"
      onUpdate={this.onUpdate}
      onCreate={this.onUpdate}
      onDelete={this.onDelete}
      fieldComponents={addressFields}
      addresses={this.props.addresses}
      expanded={this.props.expanded}
      canEdit={this.props.editable}
      canDelete={this.props.editable}
    />);
  }
}

export default UserAddresses;
