import React from 'react';

import LoanActionDialog from '../LoanActionDialog';

const withMarkAsMissing = WrappedComponent => class withMarkAsMissingComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      markAsMissingDialogOpen: false,
      loan: null,
    };
  }

  openMarkAsMissingDialog = loan => {
    this.setState({
      loan,
      markAsMissingDialogOpen: true,
    });
  }

  hideMarkAsMissingDialog = () => {
    this.setState({ markAsMissingDialogOpen: false });
  }

  render() {
    const {
      markAsMissingDialogOpen,
      loan,
    } = this.state;

    const loanActionProps = {
      loanAction: 'markAsMissing',
      modalId: 'mark-as-missing-modal',
      modalLabel: 'confirmAsMissing',
    };

    return (
      <>
        <WrappedComponent
          markAsMissing={this.openMarkAsMissingDialog}
          {...this.props}
        />
        { loan &&
          <LoanActionDialog
            loan={loan}
            loanActionProps={loanActionProps}
            open={markAsMissingDialogOpen}
            onClose={this.hideMarkAsMissingDialog}
          />
        }
      </>
    );
  }
};

export default withMarkAsMissing;
