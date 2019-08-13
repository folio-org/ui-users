import React from 'react';
import PropTypes from 'prop-types';

import { FormattedMessage } from 'react-intl';
import {
  size,
  omit,
  isEmpty,
} from 'lodash';

import {
  Button,
  Layout,
  TextArea,
  Row,
  Col,
} from '@folio/stripes/components';
import { stripesShape } from '@folio/stripes/core';

import { DueDatePicker } from '@folio/stripes/smart-components';
import SafeHTMLMessage from '@folio/react-intl-safe-html';

import BulkOverrideLoansList from './BulkOverrideLoansList';

class BulkOverrideInfo extends React.Component {
  static manifest = Object.freeze({
    renew: {
      type: 'okapi',
      fetch: false,
      POST: {
        path: 'circulation/override-renewal-by-barcode',
      },
    },
  });

  static propTypes = {
    stripes: stripesShape.isRequired,
    mutator: PropTypes.shape({
      override: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    failedRenewals: PropTypes.arrayOf(
      PropTypes.object
    ).isRequired,
    showDueDatePicker: PropTypes.bool.isRequired,
    user: PropTypes.object.isRequired,
    loanPolicies: PropTypes.object.isRequired,
    requestCounts: PropTypes.object.isRequired,
    errorMessages: PropTypes.object.isRequired,
    onCancel: PropTypes.func.isRequired,
    onCloseRenewModal: PropTypes.func.isRequired,
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
    this.INVALIDE_DATE_MESSAGE = 'Invalid date';
    this.connectedLoanList = props.stripes.connect(BulkOverrideLoansList);
  }

  toggleAll = (e) => {
    const { failedRenewals } = this.props;
    const checkedLoans = (e.target.checked)
      ? failedRenewals.reduce((memo, loan) => (Object.assign(memo, { [loan.id]: loan })), {})
      : {};

    this.setState(({ allChecked }) => ({
      allChecked: !allChecked,
      checkedLoans,
    }));
  };

  toggleItem = (e, loan) => {
    e.stopPropagation();

    const { failedRenewals } = this.props;
    const { checkedLoans: loans } = this.state;
    const { id } = loan;
    const checkedLoans = (loans[id])
      ? omit(loans, id)
      : {
        ...loans,
        [id]: loan
      };
    const allChecked = size(checkedLoans) === failedRenewals.length;

    this.setState({
      checkedLoans,
      allChecked,
    });
  };

  isLoanChecked = (id) => {
    const { checkedLoans } = this.state;

    return (id in checkedLoans);
  };

  handleDateTimeChanged = (datetime) => {
    if (datetime !== this.INVALIDE_DATE_MESSAGE) {
      this.setState({ datetime });
    }
  };

  handleAdditionalInfoChange = (event) => {
    this.setState({ additionalInfo: event.target.value });
  };

  submitOverride = () => {
    const {
      checkedLoans,
      additionalInfo,
      datetime,
    } = this.state;

    const {
      mutator: {
        renew: {
          POST,
        }
      },
      user: {
        barcode: userBarcode
      },
      onCancel,
      onCloseRenewModal,
    } = this.props;

    Object.values(checkedLoans).forEach(
      ({
        item: {
          barcode,
        },
      }) => {
        return POST(
          {
            userBarcode,
            itemBarcode: barcode,
            comment: additionalInfo,
            ...(datetime && { dueDate: datetime })
          }
        );
      }
    );

    onCancel();
    onCloseRenewModal();
  };

  render() {
    const {
      stripes,
      failedRenewals,
      loanPolicies,
      requestCounts,
      errorMessages,
      onCancel,
      showDueDatePicker,
    } = this.props;

    const {
      checkedLoans,
      allChecked,
      additionalInfo,
      datetime,
    } = this.state;

    const canBeSubmittedWithDateSelector = showDueDatePicker ? datetime : true;
    const canBeSubmitted = additionalInfo && !isEmpty(checkedLoans) && canBeSubmittedWithDateSelector;
    const selectedItems = Object.keys(checkedLoans).length;

    return (
      <div>
        <Layout className="flex">
          <Layout className="flex">
            <SafeHTMLMessage
              id="ui-users.brd.itemsSelected"
              values={{ count: selectedItems }}
            />
          </Layout>
        </Layout>
        {
          showDueDatePicker &&
            <div data-test-due-date-picker>
              <DueDatePicker
                initialValues={this.datePickerDefaults}
                stripes={stripes}
                dateProps={{ label: <FormattedMessage id="ui-users.cddd.dateRequired" /> }}
                timeProps={{ label: <FormattedMessage id="ui-users.cddd.timeRequired" /> }}
                onChange={this.handleDateTimeChanged}
              />
            </div>
        }
        <this.connectedLoanList
          allChecked={allChecked}
          stripes={stripes}
          loanPolicies={loanPolicies}
          requestCounts={requestCounts}
          errorMessages={errorMessages}
          failedRenewals={failedRenewals}
          isLoanChecked={this.isLoanChecked}
          toggleAll={this.toggleAll}
          toggleItem={this.toggleItem}
        />
        <Row>
          <Col sm={5}>
            <FormattedMessage id="ui-users.additionalInfo.placeholder">
              {placeholder => (
                <TextArea
                  label={<FormattedMessage id="ui-users.additionalInfo.label" />}
                  placeholder={placeholder}
                  required
                  onChange={this.handleAdditionalInfoChange}
                />
              )}
            </FormattedMessage>
          </Col>
        </Row>
        <Layout className="textRight">
          <Button
            onClick={onCancel}
          >
            <FormattedMessage id="ui-users.cancel" />
          </Button>
          <Button
            buttonStyle="primary"
            disabled={!canBeSubmitted}
            onClick={this.submitOverride}
          >
            <FormattedMessage id="ui-users.button.override" />
          </Button>
        </Layout>
      </div>
    );
  }
}

export default BulkOverrideInfo;
