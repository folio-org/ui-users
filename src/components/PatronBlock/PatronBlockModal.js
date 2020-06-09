import { take, orderBy } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Button,
  Col,
  Modal,
  Row
} from '@folio/stripes/components';

import css from './PatronBlockModal.css';

const PatronBlockModal = ({ open, onClose, patronBlocks, viewUserPath }) => {
  const blocks = take(orderBy(patronBlocks, ['metadata.updatedDate'], ['desc']), 3);
  const renderBlocks = blocks.map(block => {
    return (
      <Row>
        <Col xs>
          <b data-test-patron-block-reason>{block.desc || block.message || ''}</b>
        </Col>
      </Row>
    );
  });

  return (
    <Modal
      data-test-patron-block-modal
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
        <Col xs>
          <FormattedMessage id="ui-users.blocks.reason" />
          :
        </Col>
      </Row>
      {renderBlocks}
      <br />
      <Row>
        <Col xs={8}>{(patronBlocks.length > 3) && <FormattedMessage id="ui-users.blocks.additionalReasons" />}</Col>
        <Col xs={4}>
          <Row end="xs">
            <Col>
              <Button
                id="patron-block-close-modal"
                onClick={onClose}
              >
                <FormattedMessage id="ui-users.blocks.closeButton" />
              </Button>
              <Button
                id="patron-block-details-modal"
                className={css.detailsButton}
                buttonStyle="primary"
                to={viewUserPath}
              >
                <FormattedMessage id="ui-users.blocks.detailsButton" />
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
    </Modal>
  );
};

PatronBlockModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  patronBlocks: PropTypes.arrayOf(PropTypes.object),
  viewUserPath: PropTypes.string,
};

export default PatronBlockModal;
