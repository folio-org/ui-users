import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import {
  Button,
  Icon,
  Modal,
  ModalFooter,
} from '@folio/stripes/components';

class CheckDeleteUserModal extends React.Component {
  static propTypes = {
    onToggle: PropTypes.func,
    username: PropTypes.string,
    userId: PropTypes.string,
    stripes: PropTypes.shape({
      okapi: PropTypes.shape({
        tenant: PropTypes.string.isRequired,
        token: PropTypes.string.isRequired,
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
    };
  }

  showCheckDeleteModal = () => {
    const { userId, stripes } = this.props;
    const okapiUrl = stripes.okapi.url;

    // this.setState({
    //   showCheckDeleteModal: true,
    // });
    // this.props.onToggle();

    // console.log(this.httpHeaders);
    // check if user has open transactions
    fetch(`${okapiUrl}/bl-users/by-id/${userId}/open-transactions`, {
      method: 'GET',
      headers: this.httpHeaders,
    })
      .then((response) => {
        if (response.status >= 400) {
          console.log('>= 400');
          console.log(response);
        } else {
          console.log(response);
        }
      })
      .catch((err) => {
        throw new Error('Error while deleting custom report. ' + err.message);
      });
  };

  closeCheckDeleteModal = () => {
    this.setState({
      showCheckDeleteModal: false,
    });
  };

  render() {
    const { username } = this.props;

    return (
      <>
        <Button
          buttonStyle="dropdownItem"
          data-test-actions-menu-check-delete
          id="clickable-checkdeleteuser"
          onClick={() => {
            this.showCheckDeleteModal();
            // this.props.onToggle();
          }}
        >
          <Icon icon="trash">
            <FormattedMessage id="ui-users.checkDelete" />
          </Icon>
        </Button>
        <Modal
          id="delete-user-modal"
          data-test-delete-user-modal
          open={this.state.showCheckDeleteModal}
          label={<FormattedMessage id="ui-users.checkDelete" />}
          footer={
            <ModalFooter>
              <Button
                buttonStyle="danger"
                id="delete-user-button"
                // onClick={}
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
            id="ui-users.checkDelete.confirmation"
            values={{ name: username }}
          />
        </Modal>
      </>
    );
  }
}

export default injectIntl(CheckDeleteUserModal);
