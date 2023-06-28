import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Button,
  Modal,
  ModalFooter,
} from '@folio/stripes/components';

function OpenTransactionModal(props) {
  const { openTransactions, onCloseModal, username } = props;

  const renderFooter = (
    <ModalFooter>
      <Button
        data-test-open-transactions-button-ok
        id="close-open-transactions-button"
        onClick={onCloseModal}
      >
        <FormattedMessage id="ui-users.okay" />
      </Button>
    </ModalFooter>
  );

  return (
    <>
      <Modal
        id="open-transactions-modal"
        data-test-open-transactions-modal
        open
        label={<FormattedMessage id="ui-users.details.openTransactions" />}
        footer={renderFooter}
      >
        <FormattedMessage
          id="ui-users.details.openTransactions.info"
          values={{ name: username }}
        />
        <ul>
          <li><FormattedMessage id="ui-users.details.openLoans" />: {openTransactions.loans}</li>
          <li><FormattedMessage id="ui-users.details.openRequests" />: {openTransactions.requests}</li>
          <li><FormattedMessage id="ui-users.details.openFeesFines" />: {openTransactions.feesFines}</li>
          <li><FormattedMessage id="ui-users.details.openBlocks" />: {openTransactions.blocks}</li>
          <li><FormattedMessage id="ui-users.details.openUnexpiredProxy" />: {openTransactions.proxies}</li>
        </ul>
        <FormattedMessage id="ui-users.details.openTransactions.resolve" />
      </Modal>
    </>
  );
}

OpenTransactionModal.propTypes = {
  username: PropTypes.string,
  openTransactions: PropTypes.object,
  onCloseModal: PropTypes.func,
};

export default OpenTransactionModal;
