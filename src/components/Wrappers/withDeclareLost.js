import React from 'react';

import LoanActionDialog from '../LoanActionDialog';

const withDeclareLost = WrappedComponent => class WithDeclareLost extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      declareLostDialogOpen: false,
      loan: null,
    };
  }

  declareLost = loan => {
    this.setState({
      loan,
      declareLostDialogOpen: true,
    });
  }

  hideDeclareLostDialog = () => {
    this.setState({ declareLostDialogOpen: false });
  }

  render() {
    const {
      declareLostDialogOpen,
      loan,
    } = this.state;

    const loanActionProps = {
      loanAction: 'declareLost',
      modalId: 'declare-lost-modal',
      modalLabel: 'confirmLostState',
    };

    return (
      <>
        <WrappedComponent
          declareLost={this.declareLost}
          {...this.props}
        />
        { loan &&
          <LoanActionDialog
            loan={loan}
            loanActionProps={loanActionProps}
            open={declareLostDialogOpen}
            onClose={this.hideDeclareLostDialog}
          />
        }
      </>
    );
  }
};

export default withDeclareLost;
