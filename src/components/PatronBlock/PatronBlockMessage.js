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
    count: PropTypes.number.isRequired,
    intl: PropTypes.shape({}).isRequired,
  }

  render() {
    const {
      intl,
      count,
    } = this.props;
    const place = intl.formatMessage({ id: 'ui-users.blocks.textField.place' }, { count });

    return (
      <MessageBanner type="error">
        {place}
      </MessageBanner>
    );
  }
}
export default stripesConnect(injectIntl(PatronBlockMessage));
