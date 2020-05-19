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
  }

  handleAdditionalInfoChange = e => {
    this.setState({ additionalInfo: e.target.value });
  };

  render() {
    const { checkedLoansIndex, open, onCancel } = this.props;
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
            // onClick={onCancel}
          >
            <FormattedMessage id="ui-users.confirm" />
          </Button>
        </Layout>
      </ModalFooter>
    );

    const columns = ['title', 'dueDate', 'barcode', 'callNumber', 'loanPolicy'];

console.log("loans list", loans)
    const loansList =
      <MultiColumnList
        interactive={false}
        //height={props.height}
        contentData={loans}
        visibleColumns={columns}
        columnMapping={{
          title: 'Title',
          dueDate: 'Due date',
          barcode: 'Barcode',
          callNumber: 'Call number',
          loanPolicy: 'Loan policy',
        //   selected: <Checkbox
        //     name="selected-all"
        //     checked={loans.includes(false) !== true}
            // onChange={props.onToggleBulkLoanSelection}
          // />,
          // alertDetails: <FormattedMessage id="stripes-smart-components.cddd.header.alertDetails" />,
          // title: <FormattedMessage id="stripes-smart-components.cddd.header.title" />,
          // itemStatus: <FormattedMessage id="stripes-smart-components.cddd.header.itemStatus" />,
          // currentDueDate: <FormattedMessage id="stripes-smart-components.cddd.header.currentDueDate" />,
          // requests: <FormattedMessage id="stripes-smart-components.cddd.header.requests" />,
          // barcode: <FormattedMessage id="stripes-smart-components.cddd.header.barcode" />,
          // effectiveCallNumber: <FormattedMessage id="stripes-smart-components.cddd.header.effectiveCallNumber" />,
          // loanPolicy: <FormattedMessage id="stripes-smart-components.cddd.header.loanPolicy" />
        }}
        formatter={{
        //   selected: loan => <Checkbox
        //     name={`selected-${loan.id}`}
        //   //  checked={!!(loanSelection[loan.id])}
        // //   onChange={() => onToggleLoanSelection(loan)}
        //   />,
        //   // alertDetails: loan => props.alerts[loan.id] || '',
          title: loan => loan?.item?.title,
          dueDate: loan => loan?.dueDate,
          barcode: loan => loan?.item?.barcode,
          callNumber: loan => loan?.item?.callNumber,
          loanPolicy: loan => loan?.loanPolicy?.name,
        //   // itemStatus: loan => get(loan, ['item', 'status', 'name']),
        //   // currentDueDate:
        //   //   loan => <FormattedTime value={get(loan, ['dueDate'])} day="numeric" month="numeric" year="numeric" />,
        //   // requests: loan => (<div data-test-requests-count>{ requestCounts[loan.itemId] || 0 }</div>),
        //   // barcode: loan => get(loan, ['item', 'barcode']),
        //   // effectiveCallNumber: loan => getEffectiveCallNumber(loan),
        //   // loanPolicy: loan => {
        //   //   const policies = get(props, ['resources', 'loanPolicies', 'records', 0, 'loanPolicies'], []);
        //   //   const policy = policies.find(p => p.id === loan.loanPolicyId) || {};
        //   //   return policy.name;
        //   // },
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

    console.log("loans", loans)

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