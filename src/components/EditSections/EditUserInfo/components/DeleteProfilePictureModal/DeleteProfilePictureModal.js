import React from 'react';
import { PropTypes } from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { ConfirmationModal } from '@folio/stripes/components';

const DeleteProfilePictureModal = ({ open, onClose, onConfirm, personal }) => {
  const renderMessage = () => {
    const { lastName, firstName = '' } = personal;
    const name = `${lastName}${firstName ? ', ' + firstName : firstName}`;
    return (
      <FormattedMessage
        id="ui-users.information.profilePicture.delete.modal.message"
        values={{ name }}
      />
    );
  };

  return (
    <ConfirmationModal
      open={open}
      onCancel={onClose}
      onConfirm={onConfirm}
      cancelLabel={<FormattedMessage id="ui-users.no" />}
      confirmLabel={<FormattedMessage id="ui-users.yes" />}
      message={renderMessage()}
      heading={<FormattedMessage id="ui-users.information.profilePicture.delete.modal.heading" />}
    />
  );
};

DeleteProfilePictureModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  personal: PropTypes.shape({}).isRequired,
};
export default DeleteProfilePictureModal;
