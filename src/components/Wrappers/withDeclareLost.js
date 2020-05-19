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

    const modalLabel = <FormattedMessage id="ui-users.loans.confirmLostState" />;

    return (
      <>
        <WrappedComponent
          declareLost={this.declareLost}
          {...this.props}
        />
        { loan &&
          <LoanActionDialog
            loan={loan}
            loanAction={loanActionMutators.DECLARE_LOST}
            modalLabel={modalLabel}
            open={declareLostDialogOpen}
            onClose={this.hideDeclareLostDialog}
          />
        }
      </>
    );
  }
};

export default withDeclareLost;
