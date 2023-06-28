import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  take,
  orderBy,
} from 'lodash';

import {
  Button,
  Col,
  Row,
  Modal,
  TextArea,
} from '@folio/stripes/components';

import css from './OverrideModal.css';

const OverrideModal = ({
  open,
  additionalInfo,
  onSetAdditionalInfo,
  onClose,
  onSave,
  patronBlocks,
}) => {
  const blocks = take(orderBy(patronBlocks, ['metadata.updatedDate'], ['desc']), 3);
  const renderBlocks = blocks.map(block => {
    return (
      <Row key={block.id || block.patronBlockConditionId}>
        <Col xs>
          <div className={css.patronBlock}>{block.desc || block.message || ''}</div>
        </Col>
      </Row>
    );
  });

  return (
    <Modal
      data-test-override-patron-block-modal
      open={open}
      onClose={onClose}
      label={
        <span className={css.overridePatronBlockHeader}>
          <FormattedMessage id="ui-users.blocks.modal.overridePatronBlock.header" />
        </span>
      }
      dismissible
    >
      <Row>
        <Col xs>
          <FormattedMessage id="ui-users.blocks.reason" />
        </Col>
      </Row>
      <Row className={css.overridePatronBlock}>
        <Col xs>
          {renderBlocks}
        </Col>
      </Row>
      <Row>
        <Col
          xs
          data-test-override-patron-block-modal-comment
        >
          <TextArea
            label={<FormattedMessage id="ui-users.blocks.modal.comment" />}
            required
            value={additionalInfo}
            onChange={(e) => onSetAdditionalInfo(e.target.value)}
          />
        </Col>
      </Row>
      <Row end="xs">
        <Button
          data-test-override-patron-block-modal-close
          onClick={onClose}
        >
          <FormattedMessage id="ui-users.blocks.closeButton" />
        </Button>
        <Button
          data-test-override-patron-block-modal-save
          buttonStyle="primary"
          disabled={!additionalInfo}
          onClick={onSave}
        >
          <FormattedMessage id="ui-users.blocks.form.button.create" />
        </Button>
      </Row>
    </Modal>
  );
};

OverrideModal.propTypes = {
  open: PropTypes.bool.isRequired,
  additionalInfo: PropTypes.string.isRequired,
  onSetAdditionalInfo: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  patronBlocks: PropTypes.arrayOf(PropTypes.object),
};

export default OverrideModal;
