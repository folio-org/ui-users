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

import BulkOverrideLoansList from './BulkOverrideLoansList';

import {
  OVERRIDE_BLOCKS_FIELDS,
} from '../../constants';

class BulkOverrideInfo extends React.Component {
  static manifest = Object.freeze({
    renew: {
      type: 'okapi',
      fetch: false,
      POST: {
        path: 'circulation/renew-by-barcode',
      },
    },
  });

  static propTypes = {
    additionalInfo: PropTypes.string.isRequired,
    stripes: stripesShape.isRequired,
    mutator: PropTypes.shape({
      renew: PropTypes.shape({
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

  componentDidMount() {
    const {
      additionalInfo,
    } = this.props;

    this.handleAdditionalInfoChange(additionalInfo);
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

  handleAdditionalInfoChange = (value) => {
    this.setState({ additionalInfo: value });
  };

  submitOverride = () => {
    const {
      checkedLoans,
      additionalInfo,
      datetime,
    } = this.state;

    const {
      additionalInfo: additionalInfoFromPatronBlocksOverrideDialog,
      mutator: {
        renew: {
          POST,
        }
      },
      user: {
        barcode: userBarcode
      },
      stripes: {
        user: {
          user: {
            curServicePoint,
          },
        },
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
            servicePointId: curServicePoint?.id,
            [OVERRIDE_BLOCKS_FIELDS.OVERRIDE_BLOCKS]: {
              ...(additionalInfoFromPatronBlocksOverrideDialog && {
                [OVERRIDE_BLOCKS_FIELDS.PATRON_BLOCK]: {},
              }),
              [OVERRIDE_BLOCKS_FIELDS.COMMENT]: additionalInfo,
              ...(datetime
                ? {
                  [OVERRIDE_BLOCKS_FIELDS.RENEWAL_DUE_DATE_REQUIRED_BLOCK]: {
                    [OVERRIDE_BLOCKS_FIELDS.RENEWAL_DUE_DATE]: datetime,
                  },
                }
                : {
                  [OVERRIDE_BLOCKS_FIELDS.RENEWAL_BLOCK]: {},
                }
              ),
            },
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
        <FormattedMessage
          id="ui-users.brd.itemsSelected"
          values={{ count: selectedItems }}
        />
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
                  id="data-test-additional-info"
                  label={<FormattedMessage id="ui-users.additionalInfo.label" />}
                  placeholder={placeholder}
                  required
                  value={additionalInfo}
                  onChange={(event) => this.handleAdditionalInfoChange(event.target.value)}
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
