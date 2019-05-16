import React from 'react';
import { TextField } from '@folio/stripes/components';
import { stripesConnect } from '@folio/stripes/core';

import {
  injectIntl,
  intlShape,
}
  from 'react-intl';

class PatronBlockMessage extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }

  render() {
    const { intl } = this.props;
    const place = intl.formatMessage({ id: 'ui-users.blocks.textField.place' });
    return (
      <TextField fullWidth readOnly value={place} error=" " />
    );
  }
}
export default stripesConnect(injectIntl(PatronBlockMessage));
