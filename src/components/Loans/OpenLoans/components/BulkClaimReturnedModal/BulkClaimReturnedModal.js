import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedDate, injectIntl } from 'react-intl';
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
} from '@folio/stripes-components';
import SafeHTMLMessage from '@folio/react-intl-safe-html';

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
    }),
    onCancel: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    requestCounts: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      additionalInfo: '',     // The 'additional information' text included as part of a claim returned POST
      operationResults: [],   // An array of results returned from the server after a POST
      operationState: 'pre',  // Whether we're at the start ('pre') or end ('post') of a transaction
    };
  }

  // Return the number of requests for item @id
  // requestCounts is an object of the form {<item id>: <number of requests>},
  // with keys present only if the item in question has >0 requests. Thus, if
  // none of the selected items have any requests on them, requestCounts === {}.
  getRequestCountForItem = id => this.props.requestCounts[id] || 0;

  handleAdditionalInfoChange = e => {
    this.setState({ additionalInfo: e.target.value });
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
    this.setState({ operationResults: [] });
    const promises = Object
      .values(this.props.checkedLoansIndex)
      .map(loan => this.claimItemReturned(loan).catch(e => e));
    Promise.all(promises)
      .then(results => this.finishClaims(results));
  }

  finishClaims = (results) => {
    this.setState({
      operationResults: results,
      operationState: 'post',
    });
  }

  // @results: array of results of the claim-returned operation for each loan
  // Each item in the array will either be a simple object that represents a
  // successful change (including an id value) or a larger object representing
  // a CORS error (identifiable by the properties ok: false and url).
  //
  // @return array of loan IDs for which the operation returned an error.
  getUnchangedLoansList = (results) => {
    return results.filter(r => r.ok === false).map(r => r.url?.match(/^.*\/(.*)\/claim-item-returned/)[1]);
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
      open
    } = this.props;
    const {
      additionalInfo,
      operationResults,
      operationState,
    } = this.state;
    const loans = checkedLoansIndex ? Object.values(checkedLoansIndex) : [];
    // List of loans for which the claim returned operation failed
    const unchangedLoans = this.getUnchangedLoansList(operationResults);

    // Controls for the preview dialog
    const preOpFooter = (
      <ModalFooter>
        <Layout className="textRight">
          <Button
            onClick={this.onCancel}
          >
            <FormattedMessage id="ui-users.cancel" />
          </Button>
          <Button
            buttonStyle="primary"
            onClick={this.claimAllReturned}
            disabled={!additionalInfo}
            onChange={this.handleAdditionalInfoChange}
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
        <Col sm={12} className={css.additionalInformation}>
          <TextArea
            label={<FormattedMessage id="ui-users.additionalInfo.label" />}
            placeholder={intl.formatMessage({ id: 'ui-users.bulkClaimReturned.moreInfoPlaceholder' })}
            required
            onChange={this.handleAdditionalInfoChange}
          />
        </Col>
      </>;

    return (
      <Modal
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
