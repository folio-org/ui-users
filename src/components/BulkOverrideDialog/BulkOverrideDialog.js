import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { Modal } from '@folio/stripes/components';
import { stripesShape } from '@folio/stripes/core';

import BulkOverrideInfo from './BulkOverrideInfo';

class BulkOverrideDialog extends React.Component {
  static propTypes = {
    stripes: stripesShape.isRequired,
    failedRenewals: PropTypes.arrayOf(
      PropTypes.object
    ).isRequired,
    open: PropTypes.bool.isRequired,
    showDueDatePicker: PropTypes.bool.isRequired,
    user: PropTypes.object.isRequired,
    loanPolicies: PropTypes.object.isRequired,
    requestCounts: PropTypes.object.isRequired,
    errorMessages: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onCloseRenewModal: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.connectedBulkOverrideInfo = props.stripes.connect(BulkOverrideInfo);
  }

  render() {
    const {
      open,
      user,
      stripes,
      loanPolicies,
      requestCounts,
      errorMessages,
      failedRenewals,
      showDueDatePicker,
      onClose,
      onCloseRenewModal,
    } = this.props;

    const modalLabel = <FormattedMessage id="ui-users.brd.overrideAndRenew" />;

    return (
      <Modal
        id="bulk-override-modal"
        size="large"
        dismissible
        closeOnBackgroundClick
        enforceFocus={false} // Needed to allow Calendar in Datepicker to get focus
        label={modalLabel}
        open={open}
        onClose={onClose}
      >
        <this.connectedBulkOverrideInfo
          user={user}
          stripes={stripes}
          showDueDatePicker={showDueDatePicker}
          failedRenewals={failedRenewals}
          loanPolicies={loanPolicies}
          requestCounts={requestCounts}
          errorMessages={errorMessages}
          onCancel={onClose}
          onCloseRenewModal={onCloseRenewModal}
        />
      </Modal>
    );
  }
}

export default BulkOverrideDialog;
