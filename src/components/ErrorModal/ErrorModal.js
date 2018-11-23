import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { Modal, Button } from '@folio/stripes/components';

const ErrorModal = props => (
  <Modal size="small" dismissible {...props}>
    <p>{props.message}</p>
    <Button onClick={props.onClose}>
      <FormattedMessage id="ui-users.okay" />
    </Button>
  </Modal>
);

ErrorModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  label: PropTypes.string,
  message: PropTypes.string,
  id: PropTypes.string,
};

export default ErrorModal;
