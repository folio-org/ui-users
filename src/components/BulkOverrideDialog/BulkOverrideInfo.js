import React from 'react';
import PropTypes from 'prop-types';

import { FormattedMessage } from 'react-intl';
import {
  size,
  omit,
  isEmpty,
  get,
  find,
} from 'lodash';

import {
  Button,
  Layout,
  TextArea,
  Row,
  Col,
} from '@folio/stripes/components';

import { DueDatePicker } from '@folio/stripes/smart-components';
import SafeHTMLMessage from '@folio/react-intl-safe-html';

import BulkOverrideLoansList from './BulkOverrideLoansList';

class BulkOverrideInfo extends React.Component {
  static propTypes = {
    onCancel: PropTypes.func.isRequired,
    failedRenewals: PropTypes.arrayOf(
      PropTypes.object
    ).isRequired,
    stripes: PropTypes.object.isRequired,
    loanPolicies: PropTypes.object.isRequired,
    requestCounts: PropTypes.object.isRequired,
    errorMessages: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      checkedLoans: {},
      allChecked: false,
      datetime: '',
      additionalInfo: '',
    };

    this.datePickerDefaults = {
      date: '',
      time: '',
    };
    this.loanPoliciesRecords = get(props.stripes.store.getState(), 'folio_users_loan_policies.records');
    this.connectedLoanList = props.stripes.connect(BulkOverrideLoansList);
  }

  toggleAll = (e) => {
    const { failedRenewals } = this.props;
    const checkedLoans = (e.target.checked)
      ? failedRenewals.reduce((memo, loan) => (Object.assign(memo, { [loan.id]: loan })), {})
      : {};

    this.setState(({ allChecked }) => ({
      allChecked: !allChecked,
      checkedLoans
    }));
  };

  toggleItem = (e, loan) => {
    e.stopPropagation();

    const id = loan.id;
    const loans = this.state.checkedLoans;
    const checkedLoans = (loans[id])
      ? omit(loans, id)
      : { ...loans, [id]: loan };
    const allChecked = size(checkedLoans) === this.props.failedRenewals.length;

    this.setState({ checkedLoans, allChecked });
  };

  isLoanChecked = (id) => {
    const { checkedLoans } = this.state;

    return (id in checkedLoans);
  };

  handleDateTimeChanged = (datetime) => {
    if (datetime !== 'Invalid date') {
      this.setState({ datetime });
    }
  };

  handleAdditionalInfoChange = (event) => {
    this.setState({ additionalInfo: event.target.value });
  };

  submitOverride = () => {
    // Todo: should be implemented, don't have back-end yet
  };

  checkLoanPolicies() {
    const { loanPolicies } = this.props;

    for (const loanPolicyId of Object.keys(loanPolicies)) {
      const loanPolicy = find(this.loanPoliciesRecords, { id: loanPolicyId });
      const { renewable } = loanPolicy;

      if (!renewable) {
        return true;
      }
    }

    return true;
  }

  render() {
    const {
      stripes,
      failedRenewals,
      loanPolicies,
      requestCounts,
      errorMessages,
      onCancel,
    } = this.props;

    const {
      checkedLoans,
      allChecked,
      additionalInfo,
      datetime,
    } = this.state;

    const dateSelectorDisplayed = this.checkLoanPolicies();
    const canBeSubmittedWithDateSelector = dateSelectorDisplayed ? datetime : true;
    const canBeSubmitted = additionalInfo && !isEmpty(checkedLoans) && canBeSubmittedWithDateSelector;

    return (
      <div>
        <Layout className="flex">
          <Layout className="flex">
            <SafeHTMLMessage
              id="ui-users.brd.itemsSelected"
              values={{
                count: Object.keys(checkedLoans).length
              }}
            />
          </Layout>
        </Layout>
        {
          dateSelectorDisplayed &&
          <DueDatePicker
            initialValues={this.datePickerDefaults}
            stripes={this.props.stripes}
            onChange={this.handleDateTimeChanged}
            dateProps={{ label: <FormattedMessage id="ui-users.cddd.dateRequired" /> }}
            timeProps={{ label: <FormattedMessage id="ui-users.cddd.timeRequired" /> }}
          />
        }
        <this.connectedLoanList
          allChecked={allChecked}
          stripes={stripes}
          loanPolicies={loanPolicies}
          requestCounts={requestCounts}
          errorMessages={errorMessages}
          failedRenewals={failedRenewals}
          toggleAll={this.toggleAll}
          toggleItem={this.toggleItem}
          isLoanChecked={this.isLoanChecked}
          loanPoliciesRecords={this.loanPoliciesRecords}
        />
        <Row>
          <Col sm={5}>
            <TextArea
              label={<FormattedMessage id="ui-users.additionalInfo.label" />}
              placeholder={stripes.intl.formatMessage({ id: 'ui-users.additionalInfo.placeholder' })}
              required
              onChange={this.handleAdditionalInfoChange}
            />
          </Col>
        </Row>
        <Layout className="textRight">
          <Button
            disabled={!canBeSubmitted}
            onClick={this.submitOverride}
          >
            <FormattedMessage id="ui-users.button.override" />
          </Button>
          <Button
            buttonStyle="primary"
            onClick={onCancel}
          >
            <FormattedMessage id="stripes-core.button.close" />
          </Button>
        </Layout>
      </div>
    );
  }
}

export default BulkOverrideInfo;
