import React from 'react';
import PropTypes from 'prop-types';
import Modal from '@folio/stripes-components/lib/Modal';
import Button from '@folio/stripes-components/lib/Button';

const ErrorModal = props => (
  <Modal onClose={props.onClose} open={props.open} size="small" label={props.label} dismissible>
    <p>{props.message}</p>
    <Button onClick={props.onClose}>Okay</Button>
  </Modal>
);

ErrorModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  label: PropTypes.string,
  message: PropTypes.string,
};

export default ErrorModal;
