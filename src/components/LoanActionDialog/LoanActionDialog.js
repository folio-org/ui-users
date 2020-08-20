import React from 'react';
import PropTypes from 'prop-types';

import { Modal } from '@folio/stripes/components';

import ModalContent from '../ModalContent';

class LoanActionDialog extends React.Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    loan: PropTypes.object.isRequired,
    loanAction: PropTypes.string.isRequired,
    modalLabel: PropTypes.object.isRequired,
    disableButton: PropTypes.func,
    validateAction: PropTypes.func,
  };

  render() {
    const {
      onClose,
      open,
      loan,
      loanAction,
      modalLabel,
      disableButton,
      validateAction,
    } = this.props;

    if (!loan) return null;

    return (
      <Modal
        id={`${loanAction}-modal`}
        size="small"
        dismissible
        closeOnBackgroundClick
        open={open}
        label={modalLabel}
        onClose={onClose}
      >
        <ModalContent
          validateAction={validateAction}
          loanAction={loanAction}
          loan={loan}
          onClose={onClose}
          disableButton={disableButton}
        />
      </Modal>
    );
  }
}

export default LoanActionDialog;
