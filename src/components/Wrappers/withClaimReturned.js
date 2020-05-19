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
    };
  }

  openClaimReturnedDialog = loan => {
    this.setState({
      loan,
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
    } = this.state;

    const modalLabel = <FormattedMessage id="ui-users.loans.confirmClaimReturned" />;

    return (
      <>
        <WrappedComponent
          claimReturned={this.openClaimReturnedDialog}
          {...this.props}
        />
        { loan &&
          <LoanActionDialog
            loan={loan}
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
