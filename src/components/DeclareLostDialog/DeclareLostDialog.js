import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { Modal } from '@folio/stripes/components';

import DeclareLostInfo from './DeclareLostInfo';

class DeclareLostDialog extends React.Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    loan: PropTypes.object.isRequired,
  };

  render() {
    const {
      onClose,
      open,
      loan,
    } = this.props;

    if (!loan) return null;

    const modalLabel = <FormattedMessage id="ui-users.loans.confirmLostState" />;

    return (
      <Modal
        id="declare-lost-modal"
        size="small"
        dismissible
        closeOnBackgroundClick
        open={open}
        label={modalLabel}
        onClose={onClose}
      >
        <DeclareLostInfo
          loan={loan}
          onClose={onClose}
        />
      </Modal>
    );
  }
}

export default DeclareLostDialog;
