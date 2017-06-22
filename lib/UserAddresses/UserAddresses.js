import _ from 'lodash';
// We have to remove node_modules/react to avoid having multiple copies loaded.
// eslint-disable-next-line import/no-unresolved
import React, { PropTypes } from 'react';
import AddressList from '@folio/stripes-components/lib/structures/AddressFieldGroup/AddressList';
import Select from '@folio/stripes-components/lib/Select';

import Autocomplete from '../Autocomplete';
import { countriesOptions } from '../../data/countries';
import { addressTypeOptions } from '../../data/addressTypes';
import { toListAddresses, toUserAddresses } from './converters';

const addressFields = {
  country: { component: Autocomplete, props: { dataOptions: countriesOptions } },
  addressType: { component: Select, props: { dataOptions: addressTypeOptions } },
};

console.log(addressFields);

class UserAddresses extends React.Component {
  static propTypes = {
    addresses: PropTypes.arrayOf(PropTypes.object),
    onUpdate: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.onAddressUpdate = this.onAddressUpdate.bind(this);
    this.state = (props.addresses) ?
      { addresses: toListAddresses(props.addresses) } : {};
  }

  onAddressUpdate(addr) {
    this.addAddress(addr);
    this.props.onUpdate(toUserAddresses(this.state.addresses));
  }

  addAddress(addr) {
    const addresses = this.state.addresses;
    let index = 0;

    /* eslint-disable no-param-reassign */
    addr.id = addr.id || _.uniqueId();

    if (addresses.length) {
      index = _.findIndex(addresses, a => a.id === addr.id);
      if (index === -1) index = addresses.length;
    }

    addresses[index] = addr;
    this.setState({ addresses });
  }

  render() {
    if (!this.state.addresses) return (<div />);

    return (<AddressList
      onUpdate={this.onAddressUpdate}
      onCreate={this.onAddressUpdate}
      fieldComponents={addressFields}
      addresses={this.state.addresses}
      canEdit
      canDelete
    />);
  }
}

export default UserAddresses;
