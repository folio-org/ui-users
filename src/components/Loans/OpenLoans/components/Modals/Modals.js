import React from 'react';
import PropTypes from 'prop-types';

import { ChangeDueDateDialog } from '@folio/stripes/smart-components';
import { stripesShape } from '@folio/stripes/core';

// eslint-disable-next-line import/no-extraneous-dependencies
import BulkRenewalDialog from '@folio/users/src/components/BulkRenewalDialog';


class Modals extends React.Component {
  static propTypes = {
    stripes: stripesShape.isRequired,
    loans: PropTypes.arrayOf(PropTypes.object).isRequired,
    activeLoan: PropTypes.string,
    user: PropTypes.object.isRequired,
    loanPolicies: PropTypes.object.isRequired,
    errorMsg: PropTypes.object.isRequired,
    checkedLoans: PropTypes.object.isRequired,
    requestCounts: PropTypes.object.isRequired,
    renewSuccess: PropTypes.arrayOf(PropTypes.object).isRequired,
    renewFailure: PropTypes.arrayOf(PropTypes.object).isRequired,
    bulkRenewalDialogOpen: PropTypes.bool.isRequired,
    changeDueDateDialogOpen: PropTypes.bool.isRequired,
    hideChangeDueDateDialog: PropTypes.func.isRequired,
    hideBulkRenewalDialog: PropTypes.func.isRequired,
  };

  static defaultProps = {
    activeLoan: '',
  };

  constructor(props) {
    super(props);

    const { stripes } = props;
    this.connectedChangeDueDateDialog = stripes.connect(ChangeDueDateDialog);
    this.connectedBulkRenewalDialog = stripes.connect(BulkRenewalDialog);
  }

  render() {
    const {
      stripes,
      loans,
      user,
      loanPolicies,
      errorMsg,
      requestCounts,
      renewSuccess,
      renewFailure,
      bulkRenewalDialogOpen,
      changeDueDateDialogOpen,
      activeLoan,
      checkedLoans,
      hideChangeDueDateDialog,
      hideBulkRenewalDialog,
    } = this.props;

    let loanIds;
    if (activeLoan) { // Only changing one due date.
      loanIds = loans.filter(loan => activeLoan === loan.id);
    } else { // Bulk-changing due dates.
      loanIds = loans.filter(loan => checkedLoans[loan.id]);
    }

    return (
      <React.Fragment>
        <this.connectedBulkRenewalDialog
          stripes={stripes}
          successRenewals={renewSuccess}
          failedRenewals={renewFailure}
          loanPolicies={loanPolicies}
          errorMessages={errorMsg}
          requestCounts={requestCounts}
          open={bulkRenewalDialogOpen}
          onClose={hideBulkRenewalDialog}
        />
        <this.connectedChangeDueDateDialog
          stripes={stripes}
          loanIds={loanIds}
          user={user}
          open={changeDueDateDialogOpen}
          onClose={hideChangeDueDateDialog}
        />
      </React.Fragment>
    );
  }
}

export default Modals;
