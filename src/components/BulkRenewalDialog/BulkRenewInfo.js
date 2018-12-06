import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  isEmpty,
  find,
  get,
} from 'lodash';

import {
  Icon,
  Button,
  Layout,
} from '@folio/stripes/components';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import { stripesShape } from '@folio/stripes/core';

import bulkOverrideDialog from '../BulkOverrideDialog';
import BulkRenewedLoansList from './BulkRenewedLoansList';

class BulkRenewInfo extends React.Component {
  static propTypes = {
    stripes: stripesShape.isRequired,
    successRenewals: PropTypes.arrayOf(PropTypes.object).isRequired,
    failedRenewals: PropTypes.arrayOf(PropTypes.object).isRequired,
    loanPolicies: PropTypes.object.isRequired,
    requestCounts: PropTypes.object.isRequired,
    errorMessages: PropTypes.object.isRequired,
    onCancel: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.rewritableMessages = [
      'loan has reached its maximum number of renewals',
      'items with this loan policy cannot be renewed',
    ];

    this.connectedBulkOverrideDialog = props.stripes.connect(bulkOverrideDialog);
    this.connectedLoanList = props.stripes.connect(BulkRenewedLoansList);

    this.state = {
      bulkOverrideDialogOpen: false,
      overridableLoans: this.canBeOverridden(),
    };
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

    return Object.keys(errorMessages).reduce((rewritableLoans, loanCode) => {
      const errorMessage = errorMessages[loanCode];

      if (this.isOverridePossible(errorMessage)) {
        const rewritableLoan = find(failedRenewals, { 'id': loanCode });
        rewritableLoans.push(rewritableLoan);
      }

      return rewritableLoans;
    }, []);
  }

  isOverridePossible(errorMessage) {
    for (const rewritableMessage of this.rewritableMessages) {
      const stringErrorMessage = get(errorMessage, 'props.values.message.props.values.message', '');
      if (stringErrorMessage.includes(rewritableMessage)) {
        return true;
      }
    }

    return false;
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
    } = this.props;

    const {
      overridableLoans,
      bulkOverrideDialogOpen,
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
            <Button
              buttonStyle="primary"
              onClick={onCancel}
            >
              <FormattedMessage id="stripes-core.button.close" />
            </Button>
            {
              !isEmpty(overridableLoans) &&
              <Button onClick={this.openBulkOverrideDialog}>
                <FormattedMessage id="ui-users.button.override" />
              </Button>
            }
          </Layout>
        </div>
        {
          !isEmpty(overridableLoans) &&
          <this.connectedBulkOverrideDialog
            stripes={stripes}
            failedRenewals={overridableLoans}
            loanPolicies={loanPolicies}
            errorMessages={errorMessages}
            requestCounts={requestCounts}
            open={bulkOverrideDialogOpen}
            onClose={this.closeBulkOverrideDialog}
          />
        }
      </React.Fragment>
    );
  }
}

export default BulkRenewInfo;
