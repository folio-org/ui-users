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
    loanPolicies: PropTypes.object.isRequired,
    requestCounts: PropTypes.object.isRequired,
    errorMessages: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
  };

  render() {
    const {
      onClose,
      open,
      stripes,
      failedRenewals,
      loanPolicies,
      requestCounts,
      errorMessages,
    } = this.props;

    const modalLabel = <FormattedMessage id="ui-users.brd.overrideAndRenew" />;

    return (
      <Modal
        size="large"
        dismissible
        closeOnBackgroundClick
        enforceFocus={false} // Needed to allow Calendar in Datepicker to get focus
        label={modalLabel}
        open={open}
        onClose={onClose}
      >
        <BulkOverrideInfo
          stripes={stripes}
          failedRenewals={failedRenewals}
          loanPolicies={loanPolicies}
          requestCounts={requestCounts}
          errorMessages={errorMessages}
          onCancel={onClose}
        />
      </Modal>
    );
  }
}

export default BulkOverrideDialog;
