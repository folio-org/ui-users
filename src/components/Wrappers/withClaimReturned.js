import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import LoanActionDialog from '../LoanActionDialog';
import { loanActionMutators } from '../../constants';
import refundTransferClaimReturned from '../util/refundTransferClaimReturned';

const withClaimReturned = WrappedComponent => class withClaimReturnedComponent extends React.Component {
  static manifest = Object.freeze({
    feefineactions: {
      type: 'okapi',
      records: 'feefineactions',
      path: 'feefineactions',
      fetch: false,
      accumulate: true,
    },
    accounts: {
      type: 'okapi',
      records: 'accounts',
      PUT: {
        path: 'accounts/%{activeAccount.id}'
      },
      fetch: false,
      accumulate: true,
    },
    loanstorage: {
      type: 'okapi',
      PUT: {
        path: 'loan-storage/loans/%{activeLoanStorage.id}'
      },
      fetch: false,
      accumulate: true,
    },
    activeAccount: {},
    activeLoanStorage: {},
  });

  static propTypes = {
    mutator: PropTypes.shape({
      accounts: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        PUT: PropTypes.func.isRequired,
      }).isRequired,
      feefineactions: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        POST: PropTypes.func.isRequired,
      }),
      loanstorage: PropTypes.shape({
        PUT: PropTypes.func.isRequired,
        GET: PropTypes.func.isRequired,
      }).isRequired,
      activeAccount: PropTypes.shape({
        update: PropTypes.func,
      }).isRequired,
      activeLoanStorage: PropTypes.shape({
        update: PropTypes.func,
      }).isRequired,
    }).isRequired,
    loan: PropTypes.object.isRequired,
    okapi: PropTypes.shape({
      currentUser: PropTypes.object.isRequired,
    }).isRequired,
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }),
  };

  constructor(props) {
    super(props);

    this.state = {
      claimReturnedDialogOpen: false,
      claimReturnedInProgress: false,
      loan: null,
      itemRequestCount: 0,
    };
  }

  refundTransfers = async () => {
    const {
      loan,
    } = this.state;

    refundTransferClaimReturned.refundTransfers(loan, this.props);
  }


  openClaimReturnedDialog = (loan, itemRequestCount) => {
    this.setState({
      loan,
      itemRequestCount,
      claimReturnedDialogOpen: true,
    });
  }

  hideClaimReturnedDialog = () => {
    this.setState({ claimReturnedDialogOpen: false });
  }

  setClaimReturnedInProgress = (claimReturnedInProgress) => {
    this.setState({ claimReturnedInProgress });
  };

  render() {
    const {
      claimReturnedDialogOpen,
      claimReturnedInProgress,
      loan,
      itemRequestCount,
    } = this.state;

    const modalLabel = <FormattedMessage id="ui-users.loans.confirmClaimedReturned" />;

    return (
      <>
        <WrappedComponent
          claimReturned={this.openClaimReturnedDialog}
          {...this.props}
        />
        { loan &&
          <LoanActionDialog
            validateAction={this.refundTransfers}
            loan={loan}
            itemRequestCount={itemRequestCount}
            loanAction={loanActionMutators.CLAIMED_RETURNED}
            modalLabel={modalLabel}
            open={claimReturnedDialogOpen}
            isInProgress={claimReturnedInProgress}
            onClose={this.hideClaimReturnedDialog}
            toggleButton={this.setClaimReturnedInProgress}
          />
        }
      </>
    );
  }
};

export default withClaimReturned;
