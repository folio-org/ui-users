import React from 'react';
import PropTypes from 'prop-types';

import Pane from '@folio/stripes-components/lib/Pane';

import FeeFines from './FeeFinesTable';

class FeefineSettings extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
      intl: PropTypes.object.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.connectedFeeFines = props.stripes.connect(FeeFines);
  }

  render() {
    return (
      <Pane defaultWidth="fill" fluidContentWidth paneTitle={this.props.stripes.intl.formatMessage({ id: 'ui-users.feefines.title' })}>
        <this.connectedFeeFines
          {...this.props}
          nameKey="feeFineType"
        />
      </Pane>
    );
  }
}

export default FeefineSettings;
