import _ from 'lodash';
// We have to remove node_modules/react to avoid having multiple copies loaded.
// eslint-disable-next-line import/no-unresolved
import React, { PropTypes } from 'react';
import AddressList from '@folio/stripes-components/lib/structures/AddressFieldGroup/AddressList';
import Select from '@folio/stripes-components/lib/Select';

import Autocomplete from '../Autocomplete';
import { countriesOptions } from '../../data/countries';
import { addressTypeOptions } from '../../data/addressTypes';

const addressFields = {
  country: { component: Autocomplete, props: { dataOptions: countriesOptions } },
  addressType: { component: Select, props: { dataOptions: addressTypeOptions, fullWidth: true, placeholder: 'select address type' } },
};

class UserAddresses extends React.Component {
  static propTypes = {
    addresses: PropTypes.arrayOf(PropTypes.object),
    onUpdate: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.onUpdate = this.onUpdate.bind(this);
    this.onDelete = this.onDelete.bind(this);
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
    if (!this.props.addresses) return (<div />);

    return (<AddressList
      onUpdate={this.onUpdate}
      onCreate={this.onUpdate}
      onDelete={this.onDelete}
      fieldComponents={addressFields}
      addresses={this.props.addresses}
      canEdit
      canDelete
    />);
  }
}

export default UserAddresses;
