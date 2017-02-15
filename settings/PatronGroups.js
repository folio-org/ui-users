import React from 'react';

import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';

class PatronGroups extends React.Component { // eslint-disable-line
  render() {
    return (
      <Paneset>
        <Pane defaultWidth="fill" />
      </Paneset>
    );
  }
}

export default PatronGroups;
