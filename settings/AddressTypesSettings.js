import React from 'react';
import PropTypes from 'prop-types';
import ControlledVocab from '@folio/stripes-smart-components/lib/ControlledVocab';

class AddressTypesSettings extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
      intl: PropTypes.object.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.connectedControlledVocab = props.stripes.connect(ControlledVocab);
  }

  render() {
    return (
      <this.connectedControlledVocab
        {...this.props}
        baseUrl="addresstypes"
        records="addressTypes"
        label={this.props.stripes.intl.formatMessage({ id: 'ui-users.contact.addressTypes' })}
        labelSingular={this.props.stripes.intl.formatMessage({ id: 'ui-users.contact.addressType' })}
        objectLabel="Addresses"
        visibleFields={['addressType', 'desc']}
        columnMapping={{
          addressType: this.props.stripes.intl.formatMessage({ id: 'ui-users.contact.addressType' }),
          desc: this.props.stripes.intl.formatMessage({ id: 'ui-users.description' }),
        }}
        nameKey="addressType"
        id="addresstypes"
      />
    );
  }
}

export default AddressTypesSettings;
