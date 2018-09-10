import PropTypes from 'prop-types';
import React from 'react';
import Modal from '@folio/stripes-components/lib/Modal';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';

const WarningModal = props => (
  <Modal
    open={props.open}
    label="Fee/fine comment"
    onClose={props.onClose}
    size="small"
    dismissible
  >
    <Row><Col xs>TODO: Fix me</Col></Row>
  </Modal>
);

WarningModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};
