import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import {
  Button,
  Modal,
  ModalFooter,
} from '@folio/stripes/components';

const ErrorModal = (props) => {
  const footer = (
    <ModalFooter>
      <Button
        buttonStyle="primary"
        onClick={props.onClose}
      >
        <FormattedMessage id="ui-users.okay" />
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      size="small"
      footer={footer}
      dismissible
      {...props}
    >
      <p>{props.message}</p>
    </Modal>
  );
};

ErrorModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  label: PropTypes.string,
  message: PropTypes.string,
  id: PropTypes.string,
};

export default ErrorModal;
