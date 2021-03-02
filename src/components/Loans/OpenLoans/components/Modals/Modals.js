import React from 'react';
import PropTypes from 'prop-types';

import { ChangeDueDateDialog } from '@folio/stripes/smart-components';
import { stripesShape } from '@folio/stripes/core';

import PatronBlockModalWithOverrideModal from '../../../../PatronBlock/PatronBlockModalWithOverrideModal';
import BulkClaimedReturnedModal from '../BulkClaimReturnedModal';

class Modals extends React.Component {
  static propTypes = {
    stripes: stripesShape.isRequired,
    loans: PropTypes.arrayOf(PropTypes.object).isRequired,
    activeLoan: PropTypes.string,
    user: PropTypes.object.isRequired,
    patronGroup: PropTypes.object.isRequired,
    checkedLoans: PropTypes.object.isRequired,
    patronBlockedModal: PropTypes.bool.isRequired,
    patronBlocks: PropTypes.arrayOf(PropTypes.object).isRequired,
    hideChangeDueDateDialog: PropTypes.func.isRequired,
    changeDueDateDialogOpen: PropTypes.bool.isRequired,
    onClosePatronBlockedModal: PropTypes.func.isRequired,
    openPatronBlockedModal: PropTypes.func.isRequired,
    renewSelected: PropTypes.func.isRequired,
    requestCounts: PropTypes.object.isRequired,
    onBulkClaimReturnedCancel: PropTypes.func.isRequired,
    showBulkClaimReturnedModal: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    activeLoan: '',
  };

  constructor(props) {
    super(props);

    const { stripes } = props;
    this.connectedChangeDueDateDialog = stripes.connect(ChangeDueDateDialog);
    this.connectedBulkClaimReturnedDialog = stripes.connect(BulkClaimedReturnedModal);
  }

  render() {
    const {
      stripes,
      loans,
      user,
      changeDueDateDialogOpen,
      activeLoan,
      checkedLoans,
      hideChangeDueDateDialog,
      patronBlocks,
      patronBlockedModal,
      onClosePatronBlockedModal,
      openPatronBlockedModal,
      renewSelected,
      patronGroup,
      requestCounts,
      showBulkClaimReturnedModal,
      onBulkClaimReturnedCancel,
    } = this.props;

    const loanIds = activeLoan
      ? loans.filter(loan => activeLoan === loan.id) // Only changing one due date.
      : loans.filter(loan => checkedLoans[loan.id]); // Bulk-changing due dates.

    return (
      <>
        {changeDueDateDialogOpen &&
          <this.connectedChangeDueDateDialog
            user={user}
            stripes={stripes}
            loanIds={loanIds}
            open={changeDueDateDialogOpen}
            onClose={hideChangeDueDateDialog}
          />
        }
        <PatronBlockModalWithOverrideModal
          patronBlockedModalOpen={patronBlockedModal}
          onClosePatronBlockedModal={onClosePatronBlockedModal}
          onOpenPatronBlockedModal={openPatronBlockedModal}
          onRenew={renewSelected}
          patronBlocks={patronBlocks}
          viewUserPath={`/users/view/${(user || {}).id}?filters=pg.${patronGroup.group}&sort=name`}
        />
        <this.connectedBulkClaimReturnedDialog
          stripes={stripes}
          checkedLoansIndex={checkedLoans}
          requestCounts={requestCounts}
          open={showBulkClaimReturnedModal}
          onCancel={onBulkClaimReturnedCancel}
        />
      </>
    );
  }
}

export default Modals;
