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
      declareLostInProgress: false,
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

  setDeclareLostInProgress = (declareLostInProgress) => {
    this.setState({ declareLostInProgress });
  };

  render() {
    const {
      declareLostDialogOpen,
      declareLostInProgress,
      loan,
      itemRequestCount,
    } = this.state;

    const modalLabel = <FormattedMessage id="ui-users.loans.confirmDeclaredLost" />;

    return (
      <>
        <WrappedComponent
          declareLost={this.declareLost}
          declareLostInProgress={declareLostInProgress}
          setDeclareLostInProgress={this.setDeclareLostInProgress}
          {...this.props}
        />
        { loan &&
          <LoanActionDialog
            loan={loan}
            itemRequestCount={itemRequestCount}
            loanAction={loanActionMutators.DECLARE_LOST}
            modalLabel={modalLabel}
            open={declareLostDialogOpen}
            isInProgress={declareLostInProgress}
            onClose={this.hideDeclareLostDialog}
            toggleButton={this.setDeclareLostInProgress}
            {...this.props}
          />
        }
      </>
    );
  }
};

export default withDeclareLost;
