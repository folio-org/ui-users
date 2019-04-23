import React from 'react';
import PropTypes from 'prop-types';

import { ChangeDueDateDialog } from '@folio/stripes/smart-components';
import { stripesShape } from '@folio/stripes/core';

// eslint-disable-next-line import/no-extraneous-dependencies
import PatronBlockModal from '@folio/users/src/components/PatronBlock/PatronBlockModal';

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
  };

  static defaultProps = {
    activeLoan: '',
  };

  constructor(props) {
    super(props);

    const { stripes } = props;
    this.connectedChangeDueDateDialog = stripes.connect(ChangeDueDateDialog);
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
      patronGroup,
    } = this.props;

    const loanIds = activeLoan
      ? loans.filter(loan => activeLoan === loan.id) // Only changing one due date.
      : loans.filter(loan => checkedLoans[loan.id]); // Bulk-changing due dates.


    return (
      <React.Fragment>
        <this.connectedChangeDueDateDialog
          user={user}
          stripes={stripes}
          loanIds={loanIds}
          open={changeDueDateDialogOpen}
          onClose={hideChangeDueDateDialog}
        />
        <PatronBlockModal
          open={patronBlockedModal}
          patronBlocks={patronBlocks}
          onClose={onClosePatronBlockedModal}
          viewUserPath={`/users/view/${(user || {}).id}?filters=pg.${patronGroup.group}&sort=name`}
        />
      </React.Fragment>
    );
  }
}

export default Modals;
