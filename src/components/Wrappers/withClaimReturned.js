import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  cloneDeep,
  orderBy
} from 'lodash';
import moment from 'moment';
import LoanActionDialog from '../LoanActionDialog';
import { loanActionMutators, refundClaimReturned } from '../../constants';

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
    activeAccount: {},
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
      activeAccount: PropTypes.shape({
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
      loan: null,
      itemRequestCount: 0,
    };
  }


  refundTransfers = async () => {
    const getAccounts = (loanId) => {
      const {
        mutator: {
          accounts: {
            GET,
          },
        }
      } = this.props;

      const lostStatus = refundClaimReturned.LOST_ITEM_FEE;
      const processingStatus = refundClaimReturned.LOST_ITEM_PROCESSING_FEE;

      const pathParts = [
        'accounts?query=',
        `loanId=="${loanId}"`,
        ` and (feeFineType=="${lostStatus}"`,
        ` or feeFineType=="${processingStatus}")`
      ];
      const path = pathParts.reduce((acc, val) => acc + val, '');
      return GET({ path });
    };

    const setPaymentStatus = record => {
      const updatedRec = cloneDeep(record);
      updatedRec.paymentStatus.name = refundClaimReturned.PAYMENT_STATUS;
      return updatedRec;
    };

    const persistAccountRecord = record => {
      const {
        mutator: {
          activeAccount: {
            update,
          },
          accounts: {
            PUT,
          }
        }
      } = this.props;
      update({ id: record.id });
      return PUT(record);
    };

    const getAccountActions = account => {
      const {
        mutator: {
          feefineactions: {
            GET,
          }
        }
      } = this.props;
      const path = `feefineactions?query=(accountId==${account.id})&orderBy=dateAction&order=desc`;
      return GET({ path });
    };

    const filterTransferredActions = actions => actions
      .filter(
        record => record.typeAction && record.typeAction.startsWith(refundClaimReturned.TYPE_ACTION)
      );

    const persistRefundAction = action => {
      const {
        mutator: {
          feefineactions: {
            POST,
          },
        },
      } = this.props;
      return POST(action);
    };

    const createRefundActionTemplate = (account, transferredActions, type) => {
      const {
        okapi: {
          currentUser: {
            id: currentUserId,
            curServicePoint: {
              id: servicePointId
            }
          },
        },
      } = this.props;
      const orderedActions = orderBy(transferredActions, ['dateAction'], ['desc']);
      const now = moment().format();
      const amount = transferredActions.reduce((acc, record) => acc + record.amountAction, 0.0);
      const lastBalance = orderedActions[0].balance + amount;
      const balanceTotal = type.startsWith(refundClaimReturned.TRANSACTION_CREDITED)
        ? 0.0
        : lastBalance;
      const transactionVerb = type.startsWith(refundClaimReturned.TRANSACTION_CREDITED)
        ? refundClaimReturned.TRANSACTION_VERB_REFUND
        : refundClaimReturned.TRANSACTION_VERB_REFUNDED;
      const newAction = {
        dateAction: now,
        typeAction: type,
        comments: '',
        notify: false,
        amountAction: amount,
        balance: balanceTotal,
        transactionInformation: `${transactionVerb} to ${orderedActions[0].paymentMethod}`,
        source: orderedActions[0].source,
        paymentMethod: '',
        accountId: account.id,
        userId: currentUserId,
        createdAt: servicePointId,
      };
      return persistRefundAction(newAction);
    };

    const createRefunds = (account, actions) => {
      if (actions.length > 0) {
        createRefundActionTemplate(account, actions, refundClaimReturned.REFUNDED_ACTION).then(
          createRefundActionTemplate(account, actions, refundClaimReturned.CREDITED_ACTION)
        );
      }
    };

    const processAccounts = async () => {
      const {
        loan: {
          id: loanId,
        },
      } = this.props;
      const accounts = await getAccounts(loanId);
      const updatedAccounts = await Promise.all(
        accounts
          .map(setPaymentStatus)
          .map(persistAccountRecord)
      );
      const accountsActions = await Promise.all(
        updatedAccounts
          .map(getAccountActions)
      );
      const transferredActions = accountsActions
        .map(filterTransferredActions);
      const accountsWithTransferredActions = accounts
        .map((account, index) => {
          return {
            account,
            actions: transferredActions[index]
          };
        });
      await Promise.all(accountsWithTransferredActions
        .map(({ account, actions }) => createRefunds(account, actions)));
    };

    await processAccounts();
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

  render() {
    const {
      claimReturnedDialogOpen,
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
            onClose={this.hideClaimReturnedDialog}
          />
        }
      </>
    );
  }
};

export default withClaimReturned;
