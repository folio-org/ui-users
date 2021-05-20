import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import {
  Button,
  Modal,
  ModalFooter,
} from '@folio/stripes-components';

function CheckDeleteUserModal({
  onCloseModal,
  open,
  username,
}) {
  // const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);

  // const handleCloseModal = () => {
  //   setShowCloseModal(false);
  // };

  return (
    <>
      <Modal
        id="delete-user-modal"
        closeOnBackgroundClick
        data-test-delete-user-modal
        open={open}
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
                setShowCloseModal(false);
                onCloseModal();
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

CheckDeleteUserModal.propTypes = {
  // handlers: PropTypes.shape({}).isRequired,
  onCloseModal: PropTypes.func.isRequired,
  open: PropTypes.bool,
  username: PropTypes.string,
};

export default injectIntl(CheckDeleteUserModal);
