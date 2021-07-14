import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Button,
  Modal,
  ModalFooter,
} from '@folio/stripes/components';

class DeleteUserModal extends React.Component {
  static propTypes = {
    username: PropTypes.string,
    onCloseModal: PropTypes.func,
    deleteUser: PropTypes.func,
    userId: PropTypes.string,
  };

  deleteUser() {
    this.props.deleteUser(this.props.userId);
  }

  render() {
    const { onCloseModal, username } = this.props;

    return (
      <>
        <Modal
          id="delete-user-modal"
          data-test-delete-user-modal
          open
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
                onClick={onCloseModal}
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
      </>
    );
  }
}

export default DeleteUserModal;
