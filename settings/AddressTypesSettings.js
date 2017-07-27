import React from 'react';
import PropTypes from 'prop-types';
import AuthorityList from '@folio/stripes-components/lib/AuthorityList';

class AddressTypesSettings extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.connectedAuthorityList = props.stripes.connect(AuthorityList);
  }

  render() {
    return (
      <this.connectedAuthorityList
        {...this.props}
        baseUrl="addresstypes"
        records="addressTypes"
        label="Address Types"
        visibleFields={['addressType', 'desc']}
        itemTemplate={{ addressType: 'string', id: 'string', desc: 'string' }}
        nameKey="addressType"
      />
    );
  }
}

export default AddressTypesSettings;
