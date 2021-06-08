import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Button,
  Icon,
  Modal,
  ModalFooter,
} from '@folio/stripes/components';

class CheckDeleteUserModal extends React.Component {
  static propTypes = {
    // onToggle: PropTypes.func,
    username: PropTypes.string,
    userId: PropTypes.string,
    deleteUser: PropTypes.func,
    stripes: PropTypes.shape({
      okapi: PropTypes.shape({
        tenant: PropTypes.string.isRequired,
        url: PropTypes.string,
      }).isRequired,
      store: PropTypes.object.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);

    this.httpHeaders = {
      'X-Okapi-Tenant': props.stripes.okapi.tenant,
      'X-Okapi-Token': props.stripes.store.getState().okapi.token,
      'Content-Type': 'application/json'
    };

    this.state = {
      showCheckDeleteModal: false,
      showOpenTransactionsModal: false,
      openLoans: 0,
      openRequests: 0,
      openFeesFines: 0,
      openBlocks: 0,
      openUnexpiredProxy: 0,
    };
  }

  showCheckDeleteModal = () => {
    const { userId, stripes } = this.props;
    const okapiUrl = stripes.okapi.url;

    // this.props.onToggle();

    // check if user has open transactions
    fetch(`${okapiUrl}/bl-users/by-id/${userId}/open-transactions`, {
      method: 'GET',
      headers: this.httpHeaders,
    })
      .then((response) => {
        if (response.status < 400) {
          // show success
          response.json().then((json) => {
            const hasOpenTransactions = json.hasOpenTransactions;
            if (!hasOpenTransactions) {
              // no open transactions
              this.setState({
                showCheckDeleteModal: true,
              });
            } else {
              // get open transactions
              this.setState({
                showOpenTransactionsModal: true,
                openLoans: json.loans,
                openRequests: json.requests,
                openFeesFines: json.feesFines,
                openBlocks: json.blocks,
                openUnexpiredProxy: json.proxies,
              });
            }
          });
        }
      });
  };

  closeCheckDeleteModal = () => {
    this.setState({
      showCheckDeleteModal: false,
    });
  };

  deleteUser() {
    this.props.deleteUser(this.props.userId);
  }

  render() {
    const { username } = this.props;

    return (
      <>
        <Button
          buttonStyle="dropdownItem"
          data-test-actions-menu-check-delete
          id="clickable-checkdeleteuser"
          onClick={() => {
            // this.props.onToggle();
            this.showCheckDeleteModal();
          }}
        >
          <Icon icon="trash">
            <FormattedMessage id="ui-users.details.checkDelete" />
          </Icon>
        </Button>
        <Modal
          id="delete-user-modal"
          data-test-delete-user-modal
          open={this.state.showCheckDeleteModal}
          label={<FormattedMessage id="ui-users.details.checkDelete" />}
          footer={
            <ModalFooter>
              <Button
                buttonStyle="danger"
                id="delete-user-button"
                onClick={() => { this.deleteUser(); }}
              >
                <FormattedMessage id="ui-users.yes" />
              </Button>
              <Button
                id="close-delete-user-button"
                onClick={() => {
                  this.closeCheckDeleteModal();
                }}
              >
                <FormattedMessage id="ui-users.no" />
              </Button>
            </ModalFooter>
          }
        >
          <FormattedMessage
            id="ui-users.details.checkDelete.confirmation"
            values={{ name: username }}
          />
        </Modal>
        <Modal
          id="open-transactions-modal"
          data-test-open-transactions-modal
          open={this.state.showOpenTransactionsModal}
          label={<FormattedMessage id="ui-users.details.openTransactions" />}
          footer={
            <ModalFooter>
              <Button
                id="close-open-transactions-button"
                onClick={() => { this.setState({ showOpenTransactionsModal: false }); }}
              >
                <FormattedMessage id="ui-users.okay" />
              </Button>
            </ModalFooter>
          }
        >
          <FormattedMessage
            id="ui-users.details.openTransactions.info"
            values={{ name: username }}
          />
          <ul>
            <li><FormattedMessage id="ui-users.details.openLoans" />: {this.state.openLoans}</li>
            <li><FormattedMessage id="ui-users.details.openRequests" />: {this.state.openRequests}</li>
            <li><FormattedMessage id="ui-users.details.openFeesFines" />: {this.state.openFeesFines}</li>
            <li><FormattedMessage id="ui-users.details.openBlocks" />: {this.state.openBlocks}</li>
            <li><FormattedMessage id="ui-users.details.openUnexpiredProxy" />: {this.state.openUnexpiredProxy}</li>
          </ul>
          <FormattedMessage id="ui-users.details.openTransactions.resolve" />
        </Modal>
      </>
    );
  }
}

export default CheckDeleteUserModal;
