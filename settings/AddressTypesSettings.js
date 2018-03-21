import React from 'react';
import PropTypes from 'prop-types';
import ControlledVocab from '@folio/stripes-smart-components/lib/ControlledVocab';

class AddressTypesSettings extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
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
        label="Address Types"
        labelSingular="Address Type"
        objectLabel="Addresses"
        visibleFields={['addressType', 'desc']}
        columnMapping={{ addressType: 'Address Type', desc: 'Description' }}
        nameKey="addressType"
        id="addresstypes"
      />
    );
  }
}

export default AddressTypesSettings;
