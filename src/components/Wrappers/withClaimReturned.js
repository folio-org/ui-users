import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  concat,
  cloneDeep,
  last,
  orderBy,
  set,
  zip
} from 'lodash';
import moment from 'moment';
import LoanActionDialog from '../LoanActionDialog';
import { loanActionMutators } from '../../constants';

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
    };
  }

  refundTransfers = async () => {
    const getAccounts = (itemBarcode, userId) => {
      const {
        mutator: {
          accounts: {
            GET,
          },
        }
      } = this.props;
      const lostStatus = 'Lost item fee';
      const processingStatus = 'Lost item processing fee';
      const pathParts = [
        'accounts?query=',
        `barcode=="${itemBarcode}"`,
        ` and userId=="${userId}"`,
        ` and (feeFineType=="${lostStatus}"`,
        ` or feeFineType=="${processingStatus}")`
      ];
      const path = pathParts.reduce((acc, val) => acc + val, '');
      return GET({ path });
    };

    const setPaymentStatus = record => {
      const updatedRec = cloneDeep(record);
      updatedRec.paymentStatus.name = 'Suspended claim returned';
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
        record => record.typeAction && record.typeAction.startsWith('Transferred')
      );

    const getLastBalance = actions => (
      actions.length > 0
        ? orderBy(actions, ['dateAction'], ['desc'])[0].balance
        : 0.0
    );

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
      const sign = type.startsWith('Credited') ? -1 : 1;
      const amount = sign * transferredActions.reduce((acc, record) => acc + record.amountAction, 0.0);
      const transactionVerb = type.startsWith('Credited')
        ? 'Refund'
        : 'Refunded';
      return {
        dateAction: now,
        typeAction: type,
        comments: '',
        notify: false,
        amountAction: amount,
        balance: 0,
        transactionInformation: `${transactionVerb} to ${orderedActions[0].paymentMethod}`,
        source: orderedActions[0].source,
        paymentMethod: '',
        accountId: account.id,
        userId: currentUserId,
        createdAt: servicePointId,
      };
    };

    const createRefunds = (account, actions) => {
      return actions.length > 0
        ? [
          createRefundActionTemplate(account, actions, 'Credited fully'),
          createRefundActionTemplate(account, actions, 'Refunded fully')
        ]
        : [];
    };

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

    const processAccounts = async () => {
      const {
        loan: {
          item: {
            barcode: loanItemBarcode,
          },
          userId: loanUserId,
        },
      } = this.props;

      const accounts = await getAccounts(loanItemBarcode, loanUserId);

      const updatedAccounts = await Promise.all(
        accounts
          .map(setPaymentStatus)
          .map(persistAccountRecord)
      );

      const accountsActions = await Promise.all(
        updatedAccounts
          .map(getAccountActions)
      );

      const refundActions = zip(accounts, accountsActions)
        .map(([account, actions]) => [
          createRefunds(
            account,
            filterTransferredActions(actions)
          ),
          actions
        ])
        .map(
          ([refunds, actions]) => refunds
            .reduce(
              (accum, refund, index) => (
                index === 0
                  ? [set(refund, 'balance', accum + refund.amountAction)]
                  : concat(accum, set(refund, 'balance', last(accum).balance + refund.amountAction))
              ),
              getLastBalance(actions)
            )
        )
        .flat(1);

      const persistedRefundActions = await Promise.all(
        refundActions.map(persistRefundAction)
      );

      return persistedRefundActions;
    };

    await processAccounts();
  }

  openClaimReturnedDialog = loan => {
    this.setState({
      loan,
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
    } = this.state;

    const modalLabel = <FormattedMessage id="ui-users.loans.confirmClaimReturned" />;

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
