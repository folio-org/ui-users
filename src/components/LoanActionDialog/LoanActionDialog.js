import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Button,
  Modal,
  ModalFooter,
} from '@folio/stripes/components';

import ErrorModal from '../ErrorModal';
import ModalContent from '../ModalContent';

import { NO_FEE_FINE_OWNER_FOUND_MESSAGE } from '../../constants';

class LoanActionDialog extends React.Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    loan: PropTypes.object.isRequired,
    loanAction: PropTypes.string.isRequired,
    modalLabel: PropTypes.object.isRequired,
    toggleButton: PropTypes.func,
    isInProgress: PropTypes.bool,
    validateAction: PropTypes.func,
    itemRequestCount: PropTypes.number.isRequired,
  };

  setErrorMessage = errorMessage => this.setState({ errorMessage });

  clearErrorMessage = () => this.setState({ errorMessage: null });

  render() {
    const {
      onClose,
      open,
      loan,
      loanAction,
      modalLabel,
      validateAction,
      itemRequestCount,
    } = this.props;

    if (!loan) return null;

    const informativeErrorMessage = (
      <>
        <FormattedMessage id="ui-users.feefines.errors.notBilledMessage" />
        <br />
        <FormattedMessage id="ui-users.feefines.errors.updateOwnerMessage" />
      </>
    );

    const footer = (
      <ModalFooter>
        <Button
          data-test-close-button
          onClick={this.clearErrorMessage}
        >
          <FormattedMessage id="ui-users.blocks.closeButton" />
        </Button>
      </ModalFooter>
    );

    const errorModal =
      this.state?.errorMessage === NO_FEE_FINE_OWNER_FOUND_MESSAGE ?
        <ErrorModal
          label={<FormattedMessage id="ui-users.feefines.errors.notBilledTitle" />}
          open={!!this.state.errorMessage}
          message={informativeErrorMessage}
          dismissible={false}
          footer={footer}
          onClose={this.clearErrorMessage}
        />
        : null;

    return (
      <>
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
            itemRequestCount={itemRequestCount}
            onClose={onClose}
            handleError={this.setErrorMessage}
            {...this.props}
          />
        </Modal>
        {errorModal}
      </>
    );
  }
}

export default LoanActionDialog;
