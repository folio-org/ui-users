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

  toggleButton = (declarationInProgress) => {
    this.setState({ declarationInProgress });
  };

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
          toggleButton={this.toggleButton}
          {...this.props}
        />
        { loan &&
          <LoanActionDialog
            loan={loan}
            itemRequestCount={itemRequestCount}
            loanAction={loanActionMutators.DECLARE_LOST}
            modalLabel={modalLabel}
            open={declareLostDialogOpen}
            declarationInProgress={declarationInProgress}
            onClose={this.hideDeclareLostDialog}
            toggleButton={this.toggleButton}
            {...this.props}
          />
        }
      </>
    );
  }
};

export default withDeclareLost;
