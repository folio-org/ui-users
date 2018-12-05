import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { Modal } from '@folio/stripes/components';
import { stripesShape } from '@folio/stripes/core';

import BulkRenewInfo from './BulkRenewInfo';

class BulkRenewalDialog extends React.Component {
  static propTypes = {
    stripes: stripesShape.isRequired,
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    successRenewals: PropTypes.arrayOf(PropTypes.object).isRequired,
    failedRenewals: PropTypes.arrayOf(PropTypes.object).isRequired,
    loanPolicies: PropTypes.object.isRequired,
    requestCounts: PropTypes.object.isRequired,
    errorMessages: PropTypes.object.isRequired,
  };

  render() {
    const {
      stripes,
      successRenewals,
      failedRenewals,
      loanPolicies,
      requestCounts,
      errorMessages,
      onClose,
      open,
    } = this.props;

    const modalLabel = <FormattedMessage id="ui-users.brd.renewConfirmation" />;

    return (
      <Modal
        size="large"
        dismissible
        closeOnBackgroundClick
        enforceFocus={false} // Needed to allow Calendar in Datepicker to get focus
        open={open}
        label={modalLabel}
        onClose={onClose}
      >
        <BulkRenewInfo
          stripes={stripes}
          errorMessages={errorMessages}
          requestCounts={requestCounts}
          loanPolicies={loanPolicies}
          failedRenewals={failedRenewals}
          successRenewals={successRenewals}
          onCancel={onClose}
        />
      </Modal>
    );
  }
}

export default BulkRenewalDialog;
