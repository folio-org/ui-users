import React from 'react';
import PropTypes from 'prop-types';

import { Modal } from '@folio/stripes/components';

import BulkOverrideInfo from './BulkOverrideInfo';

class BulkOverrideDialog extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
      intl: PropTypes.shape({
        formatMessage: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
  };

  render() {
    const { formatMessage } = this.props.stripes.intl;
    const modalLabel = formatMessage({ id: 'ui-users.brd.overrideAndRenew' });

    return (
      <Modal
        size="large"
        dismissible
        closeOnBackgroundClick
        enforceFocus={false} // Needed to allow Calendar in Datepicker to get focus
        onClose={this.props.onClose}
        open={this.props.open}
        label={modalLabel}
      >
        <BulkOverrideInfo
          {...this.props}
          onCancel={this.props.onClose}
        />
      </Modal>
    );
  }
}

export default BulkOverrideDialog;
