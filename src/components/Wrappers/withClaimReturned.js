import React from 'react';

import ClaimReturnedDialog from '../ClaimReturnedDialog';

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

    return (
      <>
        <WrappedComponent
          claimReturned={this.openClaimReturnedDialog}
          {...this.props}
        />
        { loan &&
          <ClaimReturnedDialog
            loan={loan}
            open={claimReturnedDialogOpen}
            onClose={this.hideClaimReturnedDialog}
          />
        }
      </>
    );
  }
};

export default withClaimReturned;
