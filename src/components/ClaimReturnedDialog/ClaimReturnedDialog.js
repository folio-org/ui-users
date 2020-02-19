import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { Modal } from '@folio/stripes/components';

import ClaimReturnedInfo from './ClaimReturnedInfo';

class ClaimReturnedDialog extends React.Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    loan: PropTypes.object.isRequired,
  };

  render() {
    const {
      onClose,
      open,
      loan,
    } = this.props;

    if (!loan) return null;

    const modalLabel = <FormattedMessage id="ui-users.loans.confirmClaimReturned" />;

    return (
      <Modal
        id="claim-returned-modal"
        size="small"
        dismissible
        closeOnBackgroundClick
        open={open}
        label={modalLabel}
        onClose={onClose}
      >
        <ClaimReturnedInfo
          loan={loan}
          onClose={onClose}
        />
      </Modal>
    );
  }
}

export default ClaimReturnedDialog;
