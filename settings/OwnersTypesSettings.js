import React from 'react';
import PropTypes from 'prop-types';
import ControlledVocab from '@folio/stripes-smart-components/lib/ControlledVocab';

class OwnersTypesSettings extends React.Component {
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
        baseUrl="owners"
        records="owners"
        label="Fee/Fine Owners"
        visibleFields={['owner', 'desc']}
        itemTemplate={{ id: 'string', owner: 'string', desc: 'string' }}
        nameKey="owner"
      />
    );
  }
}

export default OwnersTypesSettings;
