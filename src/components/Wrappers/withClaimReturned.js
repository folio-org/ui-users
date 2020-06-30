import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { cloneDeep, orderBy } from 'lodash';

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
      }).isRequired,
      activeAccount: PropTypes.object,
    }).isRequired,
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }),
    loan: PropTypes.object.isRequired,
    okapi: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      claimReturnedDialogOpen: false,
      loan: null,
    };
  }

  validateClaimReturned = async () => {
    const getAccounts = (itemBarcode, userId) => {
      const {
        mutator: {
          accounts: {
            GET,
          },
        }
      } = this.props;
      const lostStatus = 'Lost Item Fee';
      const processingStatus = 'Lost Item Processing Fee';
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

    const createRefundAction = (account, actions, type) => {
      const {
        okapi: {
          currentUser: {
            id: currentUserId
          },
        },
      } = this.props;
      const orderedActions = orderBy(actions, ['dateAction'], ['desc']);
      const now = new Date().toISOString();
      const lastBalance = orderedActions[0].balance;
      const amount = actions.reduce((acc, record) => acc + record.amountAction, 0.0);
      const balance = lastBalance - amount;
      const transactionVerb = type.startsWith('Credited')
        ? 'Refund'
        : 'Refunded';
      return {
        dateAction: now,
        typeAction: type,
        comments: '',
        notify: false,
        amountAction: amount,
        balance,
        transactionInformation: `${transactionVerb} to ${actions[0].paymentMethod}`,
        source: orderedActions[0].source,
        paymentMethod: '',
        accountId: account.id,
        userId: currentUserId,
        createdAt: `${this.props.okapi.currentUser.curServicePoint.id}`,
      };
    };

    const createRefunds = (account, actions) => {
      return actions.length > 0
        ? [
          createRefundAction(account, actions, 'Credited fully-Claim returned'),
          createRefundAction(account, actions, 'Refunded fully-Claim returned')
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

      const transferredActions = accountsActions
        .map(filterTransferredActions);

      const accountsWithTransferredActions = accounts
        .map((account, index) => {
          return {
            account,
            actions: transferredActions[index]
          };
        });

      const refunds = accountsWithTransferredActions
        .map(({ account, actions }) => createRefunds(account, actions))
        .flat(1);

      await Promise.all(refunds.map(persistRefundAction));
    };

    await processAccounts(this.props.loan);
  };


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
            validateAction={this.validateClaimReturned}
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
