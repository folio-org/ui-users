import React from 'react';
import { FormattedMessage } from 'react-intl';

import LoanActionDialog from '../LoanActionDialog';

import { loanActionMutators } from '../../constants';

const withClaimReturned = WrappedComponent => class withClaimReturnedComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      claimReturnedDialogOpen: false,
      loan: null,
      itemRequestCount: 0,
    };
  }

  openClaimReturnedDialog = (loan, itemRequestCount) => {
    this.setState({
      loan,
      itemRequestCount,
      claimReturnedDialogOpen: true,
    });
  }

  hideClaimReturnedDialog = () => {
    this.setState({ claimReturnedDialogOpen: false });
  }

  render() {
    const {
      claimReturnedDialogOpen,
      loan,
      itemRequestCount,
    } = this.state;

    const modalLabel = <FormattedMessage id="ui-users.loans.confirmClaimedReturned" />;

    return (
      <>
        <WrappedComponent
          claimReturned={this.openClaimReturnedDialog}
          {...this.props}
        />
        { loan &&
          <LoanActionDialog
            loan={loan}
            itemRequestCount={itemRequestCount}
            loanAction={loanActionMutators.CLAIMED_RETURNED}
            modalLabel={modalLabel}
            open={claimReturnedDialogOpen}
            onClose={this.hideClaimReturnedDialog}
          />
        }
      </>
    );
  }
};

export default withClaimReturned;
