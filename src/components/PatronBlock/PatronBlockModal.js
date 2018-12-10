import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Button,
  Col,
  Modal,
  Row
} from '@folio/stripes/components';

const PatronBlockModal = ({ open, onClose, patronBlocks, viewUserPath }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      label={
        <b>
          {' '}
          <FormattedMessage id="ui-users.blocks.modal.header" />
          {' '}
        </b>}
      dismissible
    >
      <Row>
        <Col xs><FormattedMessage id="ui-users.blocks.reason" /></Col>
      </Row>
      <Row>
        <Col xs>
          {' '}
          <b>
            {' '}
            {patronBlocks[0].desc || ''}
            {' '}
          </b>
        </Col>
      </Row>
      <br />
      <Row end="xs">
        <Col xs>
          <Button onClick={onClose}><FormattedMessage id="ui-users.blocks.closeButton" /></Button>
          <Button style={{ 'marginLeft': '15px' }} buttonStyle="primary" to={viewUserPath}><FormattedMessage id="ui-users.blocks.detailsButton" /></Button>
        </Col>
      </Row>
    </Modal>
  );
};

PatronBlockModal.propTypes = {
  open: PropTypes.func,
  onClose: PropTypes.func,
  patronBlocks: PropTypes.func,
  viewUserPath: PropTypes.func,
};

export default PatronBlockModal;
