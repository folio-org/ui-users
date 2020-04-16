import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { Modal } from '@folio/stripes/components';

import ModalContent from '../ModalContent';

class MarkAsMissingDialog extends React.Component {
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

    const modalLabel = <FormattedMessage id="ui-users.loans.confirmAsMissing" />;

    return (
      <Modal
        id="mark-as-missing-modal"
        size="small"
        dismissible
        closeOnBackgroundClick
        open={open}
        label={modalLabel}
        onClose={onClose}
      >
        <ModalContent
          loanAction="markAsMissing"
          loan={loan}
          onClose={onClose}
        />
      </Modal>
    );
  }
}

export default MarkAsMissingDialog;
