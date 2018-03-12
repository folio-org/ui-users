import React from 'react';
import PropTypes from 'prop-types';

import Pane from '@folio/stripes-components/lib/Pane';

import FeeFines from './FeeFinesTable';

class FeefinesTypesSettings extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.connectedFeeFines = props.stripes.connect(FeeFines);
  }

  render() {
    return (
      <Pane defaultWidth="fill" fluidContentWidth paneTitle="Fees/Fines Table">
        <this.connectedFeeFines
          {...this.props}
          baseUrl="feefines"
          records="feefines"
          label="Fee/Fine Table"
          nameKey="feeFineType"
        />
      </Pane>
    );
  }
}

export default FeefinesTypesSettings;
