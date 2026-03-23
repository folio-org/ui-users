import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Button, Modal, ModalFooter } from '@folio/stripes/components';

import { renderBold } from './utils';
import css from './VersionHistoryWarningModal.css';

const VersionHistoryWarningModal = ({ open, warnings, onConfirm, onCancel }) => {
  const footer = (
    <ModalFooter>
      <Button
        buttonStyle="danger"
        onClick={onConfirm}
      >
        <FormattedMessage id="ui-users.settings.versionHistory.warning.confirm" />
      </Button>
      <Button onClick={onCancel}>
        <FormattedMessage id="ui-users.settings.versionHistory.warning.cancel" />
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      open={open}
      label={<FormattedMessage id="ui-users.settings.versionHistory.warning.title" />}
      footer={footer}
    >
      {warnings.map((warning) => (
        <p key={warning.type} className={css.warning}>
          <FormattedMessage
            id={`ui-users.settings.versionHistory.warning.${warning.type}`}
            values={{
              period: warning.formattedPeriod,
              b: renderBold,
            }}
          />
        </p>
      ))}
    </Modal>
  );
};

VersionHistoryWarningModal.propTypes = {
  open: PropTypes.bool.isRequired,
  warnings: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string.isRequired,
    formattedPeriod: PropTypes.string,
  })).isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default VersionHistoryWarningModal;
