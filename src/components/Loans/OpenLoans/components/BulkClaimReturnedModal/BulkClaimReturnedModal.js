import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedDate, injectIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { cloneDeep, orderBy, isEmpty } from 'lodash';
import moment from 'moment';

import {
  Button,
  Col,
  Layout,
  Modal,
  ModalFooter,
  MultiColumnList,
  Spinner,
  TextArea,
} from '@folio/stripes-components';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import { refundClaimReturned } from '../../../../../constants';

import { getOpenRequestsPath } from '../../../../util';

import css from '../../../../ModalContent';

class BulkClaimReturnedModal extends React.Component {
  static manifest = Object.freeze({
    claimReturned: {
      type: 'okapi',
      fetch: false,
      throwErrors: false,
      POST: {
        path: 'circulation/loans/%{loanId}/claim-item-returned',
      },
    },
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
        path: 'accounts/%{activeAccount.id}',
      },
      fetch: false,
      accumulate: true,
    },
    activeAccount: {},
    loanId: {},
  });

  static propTypes = {
    checkedLoansIndex: PropTypes.object.isRequired,
    intl: PropTypes.object.isRequired,
    mutator: PropTypes.shape({
      claimReturned: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }).isRequired,
      loanId: PropTypes.shape({
        replace: PropTypes.func.isRequired,
      }).isRequired,
      accounts: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        PUT: PropTypes.func.isRequired,
      }),
      feefineactions: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        POST: PropTypes.func.isRequired,
      }),
      activeAccount: PropTypes.shape({
        update: PropTypes.func,
      }).isRequired,
    }).isRequired,
    okapi: PropTypes.shape({
      currentUser: PropTypes.object.isRequired,
    }).isRequired,
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
      hasPerm: PropTypes.func,
    }),
    onCancel: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    requestCounts: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      additionalInfo: '',     // The 'additional information' text included as part of a claim returned POST
      operationState: 'pre',  // Whether we're at the start ('pre') or end ('post') of a transaction
      unchangedLoans: [],     // An array of loans that were *not* changed (i.e., had errors) after a POST
    };
  }

  // Return the number of requests for item @id
  // requestCounts is an object of the form {<item id>: <number of requests>},
  // with keys present only if the item in question has >0 requests. Thus, if
  // none of the selected items have any requests on them, requestCounts === {}.
  getRequestCountForItem = id => {
    const {
      requestCounts,
      stripes,
    } = this.props;

    const itemRequestCount = requestCounts[id] || 0;

    if (itemRequestCount && stripes.hasPerm('ui-users.requests.all')) {
      return (
        <Link
          data-test-item-request-count
          to={getOpenRequestsPath(id)}
        >
          {itemRequestCount}
        </Link>);
    }

    return itemRequestCount;
  }

  handleAdditionalInfoChange = e => {
    this.setState({ additionalInfo: e.target.value });
  };


  refundTransfers = async (loan) => {
    const getAccounts = () => {
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
        `loanId=="${loan.id}"`,
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
      const accounts = await getAccounts();
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


  claimItemReturned = (loan) => {
    if (!loan) return null;

    this.props.mutator.loanId.replace(loan.id);
    return this.props.mutator.claimReturned.POST(
      {
        itemClaimedReturnedDateTime: moment().format(),
        comment: this.state.additionalInfo,
      }
    );
  }

  claimAllReturned = () => {
    const promises = Object
      .values(this.props.checkedLoansIndex)
      .map(loan => this.claimItemReturned(loan).then(this.refundTransfers(loan)).catch(e => e));
    Promise.all(promises)
      .then(results => this.finishClaims(results));
  }

  finishClaims = (results) => {
    this.setState({
      operationState: 'post',
      // Each item in the results array will either be a simple object that represents a
      // successful change (including an id value) or a larger object representing
      // a CORS error (identifiable by the properties ok: false and url).
      unchangedLoans: results.filter(r => r.ok === false).map(r => r.url?.match(/^.*\/(.*)\/claim-item-returned/)[1]),
    });
  }

  onCancel = () => {
    this.setState({ operationState: 'pre' });
    this.props.onCancel();
  }

  // Renders a modal dialog containing a list of items to be claimed returned for both
  // pre-operation review and post-operation feedback (i.e., there's one modal, but the
  // contents will be different before and after clicking the 'Confirm' button.)
  render() {
    const {
      checkedLoansIndex,
      intl,
      open,
    } = this.props;
    const {
      additionalInfo,
      operationState,
      unchangedLoans, // List of loans for which the claim returned operation failed
    } = this.state;
    const loans = checkedLoansIndex ? Object.values(checkedLoansIndex) : [];

    // Controls for the preview dialog
    const preOpFooter = (
      <ModalFooter>
        <Layout className="textRight">
          <Button
            data-test-bulk-cr-cancel-button
            onClick={this.onCancel}
          >
            <FormattedMessage id="ui-users.cancel" />
          </Button>
          <Button
            data-test-bulk-cr-confirm-button
            buttonStyle="primary"
            onClick={this.claimAllReturned}
            disabled={!additionalInfo}
          >
            <FormattedMessage id="ui-users.confirm" />
          </Button>
        </Layout>
      </ModalFooter>
    );

    // Control for the feedback dialog
    const postOpFooter = (
      <ModalFooter>
        <Layout className="textRight">
          <Button
            data-test-bulk-cr-close-button
            buttonStyle="primary"
            onClick={this.onCancel}
          >
            <FormattedMessage id="ui-users.blocks.closeButton" />
          </Button>
        </Layout>
      </ModalFooter>
    );

    const columns = ['title', 'dueDate', 'requests', 'barcode', 'callNumber', 'loanPolicy'];
    if (operationState === 'post') { columns.unshift('status'); }

    const statuses = {
      OK: <FormattedMessage id="ui-users.bulkClaimReturned.status.ok" />,
      NOT_OK: <FormattedMessage id="ui-users.bulkClaimReturned.status.notOk" />,
    };

    const loansList =
      <MultiColumnList
        interactive={false}
        contentData={loans}
        visibleColumns={columns}
        columnMapping={{
          status: <FormattedMessage id="ui-users.bulkClaimReturned.status" />,
          title: <FormattedMessage id="ui-users.bulkClaimReturned.item.title" />,
          dueDate: <FormattedMessage id="ui-users.dueDate" />,
          requests: <FormattedMessage id="ui-users.loans.details.requests" />,
          barcode: <FormattedMessage id="ui-users.item.barcode" />,
          callNumber: <FormattedMessage id="ui-users.item.callNumberComponents.callNumber" />,
          loanPolicy: <FormattedMessage id="ui-users.loans.details.loanPolicy" />,
        }}
        formatter={{
          status: loan => (unchangedLoans.includes(loan.id) ? statuses.NOT_OK : statuses.OK),
          title: loan => loan?.item?.title,
          dueDate: loan => <FormattedDate value={loan?.dueDate} />,
          requests: loan => this.getRequestCountForItem(loan?.item?.id),
          barcode: loan => loan?.item?.barcode,
          callNumber: loan => loan?.item?.callNumber,
          loanPolicy: loan => loan?.loanPolicy?.name,
        }}
      />;

    let modalHeader;
    let statusMessage;
    if (operationState === 'pre') {
      modalHeader = <FormattedMessage id="ui-users.bulkClaimReturned.preConfirm" />;
      statusMessage =
        <SafeHTMLMessage
          id="ui-users.bulkClaimReturned.summary"
          values={{ numLoans: loans.length }}
        />;
    } else {
      const numSuccessfulOperations = loans.length - unchangedLoans.length;
      modalHeader = <FormattedMessage id="ui-users.bulkClaimReturned.postConfirm" />;
      statusMessage = unchangedLoans.length > 0 ?
        <>
          <SafeHTMLMessage
            id="ui-users.bulkClaimReturned.items.notOk"
            values={{ numItems: unchangedLoans.length }}
          />
          {' '}
          <SafeHTMLMessage
            id="ui-users.bulkClaimReturned.items.ok"
            values={{ numItems: numSuccessfulOperations }}
          />
        </> :
        <SafeHTMLMessage
          id="ui-users.bulkClaimReturned.items.ok"
          values={{ numItems: numSuccessfulOperations }}
        />;
    }

    const modalContent =
      <>
        {statusMessage}
        {loansList}
        {operationState === 'pre' &&
          <Col sm={12} className={css.additionalInformation}>
            <TextArea
              data-test-bulk-claim-returned-additionalInfo
              label={<FormattedMessage id="ui-users.additionalInfo.label" />}
              placeholder={intl.formatMessage({ id: 'ui-users.bulkClaimReturned.moreInfoPlaceholder' })}
              required
              onChange={this.handleAdditionalInfoChange}
            />
          </Col>
        }
      </>;

    return (
      <Modal
        data-test-bulk-claim-returned-modal
        label={modalHeader}
        closeOnBackgroundClick
        dismissible
        onClose={this.onCancel}
        open={open}
        footer={operationState === 'pre' ? preOpFooter : postOpFooter}
      >
        {
          isEmpty(loans) ?
            <Layout className="textCentered">
              <Spinner />
            </Layout> :
            modalContent
        }
      </Modal>
    );
  }
}

export default injectIntl(BulkClaimReturnedModal);
