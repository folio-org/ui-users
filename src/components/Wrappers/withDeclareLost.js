import React from 'react';
import { FormattedMessage } from 'react-intl';

import LoanActionDialog from '../LoanActionDialog';

import { loanActionMutators } from '../../constants';

const withDeclareLost = WrappedComponent => class WithDeclareLost extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      declareLostDialogOpen: false,
      loan: null,
      declarationInProgress: false,
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

  disableButton = () => {
    this.setState({ declarationInProgress: true });
  }

  enableButton = () => {
    this.setState({ declarationInProgress: false });
  }

  render() {
    const {
      declareLostDialogOpen,
      declarationInProgress,
      loan,
    } = this.state;

    const modalLabel = <FormattedMessage id="ui-users.loans.confirmLostState" />;

    return (
      <>
        <WrappedComponent
          declareLost={this.declareLost}
          declarationInProgress={declarationInProgress}
          enableButton={this.enableButton}
          {...this.props}
        />
        { loan &&
          <LoanActionDialog
            loan={loan}
            loanAction={loanActionMutators.DECLARE_LOST}
            modalLabel={modalLabel}
            open={declareLostDialogOpen}
            onClose={this.hideDeclareLostDialog}
            disableButton={this.disableButton}
          />
        }
      </>
    );
  }
};

export default withDeclareLost;
