import React from 'react';
import { FormattedMessage } from 'react-intl';

import LoanActionDialog from '../LoanActionDialog';

import { loanActionMutators } from '../../constants';

const withMarkAsMissing = WrappedComponent => class withMarkAsMissingComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      markAsMissingDialogOpen: false,
      loan: null,
      itemRequestCount: 0,
    };
  }

  openMarkAsMissingDialog = (loan, itemRequestCount) => {
    this.setState({
      loan,
      itemRequestCount,
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
      itemRequestCount,
    } = this.state;

    const modalLabel = <FormattedMessage id="ui-users.loans.confirmMissing" />;

    return (
      <>
        <WrappedComponent
          markAsMissing={this.openMarkAsMissingDialog}
          {...this.props}
        />
        { loan &&
          <LoanActionDialog
            loan={loan}
            itemRequestCount={itemRequestCount}
            loanAction={loanActionMutators.MARK_AS_MISSING}
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
