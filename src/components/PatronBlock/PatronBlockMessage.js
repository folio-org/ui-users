import React from 'react';
import PropTypes from 'prop-types';
import { MessageBanner } from '@folio/stripes/components';
import { stripesConnect } from '@folio/stripes/core';

import {
  injectIntl,
}
  from 'react-intl';

class PatronBlockMessage extends React.Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
  }

  render() {
    const { intl } = this.props;
    const place = intl.formatMessage({ id: 'ui-users.blocks.textField.place' });
    return (
      <MessageBanner type="error">
        {place}
      </MessageBanner>
    );
  }
}
export default stripesConnect(injectIntl(PatronBlockMessage));
