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
    onToggle: PropTypes.func.isRequired,
    username: PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.state = {
      showCheckDeleteModal: false,
    };
  }

  showCheckDeleteModal = () => {
    this.setState({
      showCheckDeleteModal: true,
    });
    // this.props.onToggle();
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
