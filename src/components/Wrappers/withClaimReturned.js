import React from 'react';

import LoanActionDialog from '../LoanActionDialog';

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

    const loanActionProps = {
      loanAction: 'claimReturned',
      modalId: 'claim-returned-modal',
      modalLabel: 'confirmClaimReturned',
    };

    return (
      <>
        <WrappedComponent
          claimReturned={this.openClaimReturnedDialog}
          {...this.props}
        />
        { loan &&
          <LoanActionDialog
            loan={loan}
            loanActionProps={loanActionProps}
            open={claimReturnedDialogOpen}
            onClose={this.hideClaimReturnedDialog}
          />
        }
      </>
    );
  }
};

export default withClaimReturned;
