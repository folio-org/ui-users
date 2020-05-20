import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { isEmpty } from 'lodash';

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

  constructor(props) {
    super(props);

    this.state = {
      additionalInfo: '',
    };

    this.handleAdditionalInfoChange = this.handleAdditionalInfoChange.bind(this)
  }

  // Return the number of requests for item @id
  // requestCounts is an object of the form {<item id>: <number of requests>},
  // with keys present only if the item in question has >0 requests. Thus, if
  // none of the selected items have any requests on them, requestCounts === {}.
  getRequestCountForItem = id => this.props.requestCounts[id] || 0;

  handleAdditionalInfoChange = e => {
    console.log("calling")
    this.setState({ additionalInfo: e.target.value });
  };

  claimAllReturned = () => {
    console.log("claiming returned")
  }

  render() {
    const { checkedLoansIndex, open, onCancel, requestCounts } = this.props;
    const { additionalInfo } = this.state;
    const loans = checkedLoansIndex ? Object.values(checkedLoansIndex) : [];

    const footer = (
      <ModalFooter>
        <Layout className="textRight">
          <Button
            onClick={onCancel}
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

console.log("loans list", loans)
    const loansList =
      <MultiColumnList
        interactive={false}
        //height={props.height}
        contentData={loans}
        visibleColumns={columns}
        columnMapping={{
          title: <FormattedMessage id="ui-users.bulkClaimReturned.item.title" />,
          dueDate: <FormattedMessage id="ui-users.dueDate" />,
          requests: <FormattedMessage id="ui-users.loans.details.requests" />,
          barcode: <FormattedMessage id="ui-users.item.barcode" />,
          callNumber: <FormattedMessage id="ui-users.item.callNumberComponents.callNumber" />,
          loanPolicy: <FormattedMessage id="ui-users.loans.details.loanPolicy" />,
        }}
        formatter={{
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

      const modalContent =
        <>
          <span>{loans.length} item(s) will be claimed returned.</span>
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
        label="Confirm claimed returned"
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