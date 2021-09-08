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
      itemRequestCount: 0,
      declarationInProgress: false,
    };
  }

  declareLost = (loan, itemRequestCount) => {
    this.setState({
      loan,
      itemRequestCount,
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
      itemRequestCount,
    } = this.state;

    const modalLabel = <FormattedMessage id="ui-users.loans.confirmDeclaredLost" />;

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
            itemRequestCount={itemRequestCount}
            loanAction={loanActionMutators.DECLARE_LOST}
            modalLabel={modalLabel}
            open={declareLostDialogOpen}
            onClose={this.hideDeclareLostDialog}
            disableButton={this.disableButton}
            {...this.props}
          />
        }
      </>
    );
  }
};

export default withDeclareLost;
