import React from 'react';
import { TextField } from '@folio/stripes/components';
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
      <TextField id="patron-block-place" fullWidth readOnly value={place} error=" " />
    );
  }
}
export default injectIntl(PatronBlockMessage);
