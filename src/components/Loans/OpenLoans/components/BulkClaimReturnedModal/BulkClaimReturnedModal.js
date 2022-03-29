import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedDate, injectIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { isEmpty } from 'lodash';
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
} from '@folio/stripes/components';

import { getOpenRequestsPath } from '../../../../util';
import refundTransferClaimReturned from '../../../../util/refundTransferClaimReturned';

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
    this.setState({ additionalInfo: e.target.value.trim() });
  };

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
      .map(loan => this.claimItemReturned(loan)
        .then(refundTransferClaimReturned.refundTransfers(loan, this.props))
        .catch(e => e));
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

    const columns = [
      'bulkClaimReturnedTitle',
      'bulkClaimReturnedDueDate',
      'bulkClaimReturnedRequests',
      'bulkClaimReturnedBarcode',
      'bulkClaimReturnedCallNumber',
      'bulkClaimReturnedLoanPolicy',
    ];
    if (operationState === 'post') { columns.unshift('bulkClaimReturnedStatus'); }

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
          bulkClaimReturnedStatus: <FormattedMessage id="ui-users.bulkClaimReturned.status" />,
          bulkClaimReturnedTitle: <FormattedMessage id="ui-users.bulkClaimReturned.item.title" />,
          bulkClaimReturnedDueDate: <FormattedMessage id="ui-users.dueDate" />,
          bulkClaimReturnedRequests: <FormattedMessage id="ui-users.loans.details.requests" />,
          bulkClaimReturnedBarcode: <FormattedMessage id="ui-users.item.barcode" />,
          bulkClaimReturnedCallNumber: <FormattedMessage id="ui-users.item.callNumberComponents.callNumber" />,
          bulkClaimReturnedLoanPolicy: <FormattedMessage id="ui-users.loans.details.loanPolicy" />,
        }}
        formatter={{
          bulkClaimReturnedStatus: loan => (unchangedLoans.includes(loan.id) ? statuses.NOT_OK : statuses.OK),
          bulkClaimReturnedTitle: loan => loan?.item?.title,
          bulkClaimReturnedDueDate: loan => <FormattedDate value={loan?.dueDate} />,
          bulkClaimReturnedRequests: loan => this.getRequestCountForItem(loan?.item?.id),
          bulkClaimReturnedBarcode: loan => loan?.item?.barcode,
          bulkClaimReturnedCallNumber: loan => loan?.item?.callNumber,
          bulkClaimReturnedLoanPolicy: loan => loan?.loanPolicy?.name,
        }}
      />;

    let modalHeader;
    let statusMessage;
    if (operationState === 'pre') {
      modalHeader = <FormattedMessage id="ui-users.bulkClaimReturned.preConfirm" />;
      statusMessage =
        <FormattedMessage
          id="ui-users.bulkClaimReturned.summary"
          values={{ numLoans: loans.length }}
        />;
    } else {
      const numSuccessfulOperations = loans.length - unchangedLoans.length;
      modalHeader = <FormattedMessage id="ui-users.bulkClaimReturned.postConfirm" />;
      statusMessage = unchangedLoans.length > 0 ?
        <>
          <FormattedMessage
            id="ui-users.bulkClaimReturned.items.notOk"
            values={{ numItems: unchangedLoans.length }}
          />
          {' '}
          <FormattedMessage
            id="ui-users.bulkClaimReturned.items.ok"
            values={{ numItems: numSuccessfulOperations }}
          />
        </> :
        <FormattedMessage
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
              data-test-bulk-claim-returned-additional-info
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
