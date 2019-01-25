import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { isEmpty } from 'lodash';

import {
  Icon,
  Button,
  Layout,
} from '@folio/stripes/components';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import { stripesShape } from '@folio/stripes/core';

import BulkOverrideDialog from '../BulkOverrideDialog';
import BulkRenewedLoansList from './BulkRenewedLoansList';

class BulkRenewInfo extends React.Component {
  static propTypes = {
    stripes: stripesShape.isRequired,
    successRenewals: PropTypes.arrayOf(PropTypes.object).isRequired,
    failedRenewals: PropTypes.arrayOf(PropTypes.object).isRequired,
    loanPolicies: PropTypes.object.isRequired,
    requestCounts: PropTypes.object.isRequired,
    errorMessages: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    onCancel: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.connectedLoanList = props.stripes.connect(BulkRenewedLoansList);

    this.state = {
      showDueDatePicker: false,
      bulkOverrideDialogOpen: false,
    };
  }

  componentDidMount() {
    this.setState({ overridableLoans: this.canBeOverridden() });
  }

  openBulkOverrideDialog = () => {
    this.setState({ bulkOverrideDialogOpen: true });
  };

  closeBulkOverrideDialog = () => {
    this.setState({ bulkOverrideDialogOpen: false });
  };

  canBeOverridden() {
    const {
      failedRenewals,
      errorMessages,
    } = this.props;

    return failedRenewals.reduce((overridableLoans, loan) => {
      const { id } = loan;
      const {
        overridable,
        autoNewDueDate,
      } = errorMessages[id];

      if (overridable) {
        overridableLoans.push({ ...loan, autoNewDueDate });
        if (!autoNewDueDate) {
          this.setState({ showDueDatePicker: true });
        }
      }

      return overridableLoans;
    }, []);
  }

  render() {
    const {
      stripes,
      successRenewals,
      failedRenewals,
      loanPolicies,
      requestCounts,
      errorMessages,
      onCancel,
      user,
    } = this.props;

    const {
      overridableLoans,
      bulkOverrideDialogOpen,
      showDueDatePicker,
    } = this.state;

    return (
      <React.Fragment>
        <div>
          <Layout className="flex">
            {
              !isEmpty(failedRenewals) &&
              <Layout className="flex">
                <Icon
                  size="medium"
                  icon="exclamation-circle"
                  status="warn"
                />
                <SafeHTMLMessage
                  id="ui-users.brd.itemNotRenewed"
                  values={{
                    count: failedRenewals.length
                  }}
                />
              </Layout>
            }
            {
              !isEmpty(successRenewals) &&
              <Layout className="flex">
                <Icon
                  size="medium"
                  icon="check-circle"
                  status="success"
                />
                <SafeHTMLMessage
                  id="ui-users.brd.itemSuccessfullyRenewed"
                  values={{
                    count: successRenewals.length
                  }}
                />
              </Layout>
            }
          </Layout>
          <this.connectedLoanList
            stripes={stripes}
            successRenewals={successRenewals}
            failedRenewals={failedRenewals}
            loanPolicies={loanPolicies}
            requestCounts={requestCounts}
            errorMessages={errorMessages}
          />
          <Layout className="textRight">
            {
              !isEmpty(overridableLoans) &&
              <Button onClick={this.openBulkOverrideDialog}>
                <FormattedMessage id="ui-users.button.override" />
              </Button>
            }
            <Button
              buttonStyle="primary"
              onClick={onCancel}
            >
              <FormattedMessage id="stripes-core.button.close" />
            </Button>
          </Layout>
        </div>
        {
          !isEmpty(overridableLoans) &&
          <BulkOverrideDialog
            user={user}
            stripes={stripes}
            showDueDatePicker={showDueDatePicker}
            failedRenewals={overridableLoans}
            loanPolicies={loanPolicies}
            errorMessages={errorMessages}
            requestCounts={requestCounts}
            open={bulkOverrideDialogOpen}
            onCloseRenewModal={onCancel}
            onClose={this.closeBulkOverrideDialog}
          />
        }
      </React.Fragment>
    );
  }
}

export default BulkRenewInfo;
