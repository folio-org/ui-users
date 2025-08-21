import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { Modal } from '@folio/stripes/components';
import { stripesShape } from '@folio/stripes/core';

import BulkRenewInfo from './BulkRenewInfo';

class BulkRenewalDialog extends React.Component {
  static propTypes = {
    additionalInfo: PropTypes.string.isRequired,
    stripes: stripesShape.isRequired,
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    successRenewals: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    failedRenewals: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    loanPolicies: PropTypes.shape({}).isRequired,
    user: PropTypes.shape({}).isRequired,
    requestCounts: PropTypes.shape({}).isRequired,
    errorMessages: PropTypes.shape({}).isRequired,
  };

  render() {
    const {
      additionalInfo,
      stripes,
      successRenewals,
      failedRenewals,
      loanPolicies,
      requestCounts,
      errorMessages,
      onClose,
      open,
      user,
    } = this.props;

    const modalLabel = <FormattedMessage id="ui-users.brd.renewConfirmation" />;

    return (
      <Modal
        id="bulk-renewal-modal"
        size="large"
        dismissible
        closeOnBackgroundClick
        enforceFocus={false} // Needed to allow Calendar in Datepicker to get focus
        open={open}
        label={modalLabel}
        onClose={onClose}
      >
        <BulkRenewInfo
          additionalInfo={additionalInfo}
          user={user}
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
