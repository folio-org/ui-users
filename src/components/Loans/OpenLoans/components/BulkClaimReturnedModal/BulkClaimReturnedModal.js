import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { isEmpty } from 'lodash';
import moment from 'moment';

import {
  Button,
  Checkbox,
  Col,
  Icon,
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
    mutator: PropTypes.shape({
      claimReturned: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }).isRequired,
      itemId: PropTypes.shape({
        replace: PropTypes.func.isRequired,
      }).isRequired,
    })
  }

  constructor(props) {
    super(props);

    this.state = {
      additionalInfo: '',     // The 'additional information' text included as part of a claim returned POST
      operationResults: [],   // An array of results returned from the server after a POST
      operationState: 'pre',  // Whether we're at the start ('pre') or end ('post') of a transaction
    };

   // this.claimAllReturned = this.claimAllReturned.bind(this);
  //  this.handleAdditionalInfoChange = this.handleAdditionalInfoChange.bind(this)
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

    this.props.mutator.loanId.replace('abc');
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

  render() {
    const { checkedLoansIndex, open } = this.props;
    const {
      additionalInfo,
      operationResults,
      operationState,
    } = this.state;
    const loans = checkedLoansIndex ? Object.values(checkedLoansIndex) : [];
    // List of loans for which the claim returned operation failed
    const unchangedLoans = this.getUnchangedLoansList(operationResults);
    console.log("unchangedloans", unchangedLoans)

    const footer = (
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

    const columns = ['title', 'dueDate', 'requests', 'barcode', 'callNumber', 'loanPolicy'];
    if (operationState === 'post') { columns.unshift('status'); }
    const statuses = {
      OK: 'Item successfully claimed returned',
      NOT_OK: 'Item could not be claimed returned',
    };

console.log("loans list", loans)
console.log("results", operationResults)
    const loansList =
      <MultiColumnList
        interactive={false}
        //height={props.height}
        contentData={loans}
        visibleColumns={columns}
        columnMapping={{
          status: 'Claim returned status',
          title: <FormattedMessage id="ui-users.bulkClaimReturned.item.title" />,
          dueDate: <FormattedMessage id="ui-users.dueDate" />,
          requests: <FormattedMessage id="ui-users.loans.details.requests" />,
          barcode: <FormattedMessage id="ui-users.item.barcode" />,
          callNumber: <FormattedMessage id="ui-users.item.callNumberComponents.callNumber" />,
          loanPolicy: <FormattedMessage id="ui-users.loans.details.loanPolicy" />,
        }}
        formatter={{
          status: loan => unchangedLoans.includes(loan.id) ? statuses.NOT_OK : statuses.OK,
          title: loan => loan?.item?.title,
          dueDate: loan => loan?.dueDate,
          requests: loan => this.getRequestCountForItem(loan?.item?.id),
          barcode: loan => loan?.item?.barcode,
          callNumber: loan => loan?.item?.callNumber,
          loanPolicy: loan => loan?.loanPolicy?.name,
        }}
        // columnWidths={{
          // alertDetails: 120,
          // selected: 40,
        // }}
      />

      let modalHeader, statusMessage;
      if (operationState === 'pre') {
        modalHeader = "Confirm claimed returned";
        statusMessage = <span>{loans.length} item(s) will be claimed returned.</span>;
      }
      else {
        const numSuccessfulOperations = loans.length - unchangedLoans.length;
        modalHeader = "Claim returned confirmation";
        statusMessage = <span>{unchangedLoans.length} item(s) <strong>not</strong> claimed returned. {numSuccessfulOperations} item(s) successfully claimed returned.</span>;
      }

      const modalContent =
        <>
          {statusMessage}
          {loansList}
          <Col sm={12} className={css.additionalInformation}>
            <TextArea
              label={<FormattedMessage id="ui-users.additionalInfo.label" />}
              required
              onChange={this.handleAdditionalInfoChange}
            />
          </Col>
        </>

    return (
      <Modal
        label={modalHeader}
        dismissible
        open={open}
        footer={footer}
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

export default BulkClaimReturnedModal;