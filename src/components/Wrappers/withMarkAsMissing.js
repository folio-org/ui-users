import React from 'react';
import { FormattedMessage } from 'react-intl';

import LoanActionDialog from '../LoanActionDialog';

import { loanActions } from '../../constants';

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

    const modalLabel = <FormattedMessage id="ui-users.loans.confirmAsMissing" />;

    return (
      <>
        <WrappedComponent
          markAsMissing={this.openMarkAsMissingDialog}
          {...this.props}
        />
        { loan &&
          <LoanActionDialog
            loan={loan}
            loanAction={loanActions.MARK_AS_MISSING}
            modalLabel={modalLabel}
            open={markAsMissingDialogOpen}
            onClose={this.hideMarkAsMissingDialog}
          />
        }
      </>
    );
  }
};

export default withMarkAsMissing;
