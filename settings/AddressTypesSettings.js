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
        visibleFields={['addressType', 'desc']}
        columnMapping={{ addressType: 'Address Type', desc: 'Description' }}
        itemTemplate={{ addressType: 'string', id: 'string', desc: 'string' }}
        nameKey="addressType"
        addButtonId="clickable-add-addressType"
      />
    );
  }
}

export default AddressTypesSettings;
