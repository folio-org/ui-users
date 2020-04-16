import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { Modal } from '@folio/stripes/components';

import ModalContent from '../ModalContent';

class LoanActionDialog extends React.Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    loan: PropTypes.object.isRequired,
    loanActionProps: PropTypes.object.isRequired,
  };

  render() {
    const {
      onClose,
      open,
      loan,
      loanActionProps: {
        loanAction,
        modalId,
        modalLabel,
      },
    } = this.props;

    if (!loan) return null;

    const label = <FormattedMessage id={`ui-users.loans.${modalLabel}`} />;

    return (
      <Modal
        id={modalId}
        size="small"
        dismissible
        closeOnBackgroundClick
        open={open}
        label={label}
        onClose={onClose}
      >
        <ModalContent
          loanAction={loanAction}
          loan={loan}
          onClose={onClose}
        />
      </Modal>
    );
  }
}

export default LoanActionDialog;
