import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Icon,
  Button,
  Layout,
} from '@folio/stripes/components';
import SafeHTMLMessage from '@folio/react-intl-safe-html';

import BulkRenewedLoansList from './BulkRenewedLoansList';

class BulkRenewInfo extends React.Component {
  static propTypes = {
    stripes: PropTypes.object,
    onCancel: PropTypes.func,
    successRenewals: PropTypes.arrayOf(PropTypes.object),
    failedRenewals: PropTypes.arrayOf(PropTypes.object),
    loanPolicies: PropTypes.object,
    requestCounts: PropTypes.object,
    errorMessages: PropTypes.object,
  }

  constructor(props) {
    super(props);
    this.connectedLoanList = props.stripes.connect(BulkRenewedLoansList);
  }

  render() {
    const { successRenewals, failedRenewals } = this.props;
    return (
      <div>
        <Layout className="flex">
          { failedRenewals.length > 0 ?
            <Layout className="flex">

              <Icon size="medium" icon="exclamation-circle" status="warn" />
              <SafeHTMLMessage
                id="ui-users.brd.itemNotRenewed"
                values={{
                  count: failedRenewals.length
                }}
              />
            </Layout>
            : null
            }
          { successRenewals.length > 0 ?
            <Layout className="flex">
              <Icon size="medium" icon="check-circle" status="success" />
              <SafeHTMLMessage
                id="ui-users.brd.itemSuccessfullyRenewed"
                values={{
                  count: successRenewals.length
                }}
              />
            </Layout>
            : null
          }
        </Layout>
        <this.connectedLoanList
          stripes={this.props.stripes}
          successRenewals={this.props.successRenewals}
          failedRenewals={this.props.failedRenewals}
          loanPolicies={this.props.loanPolicies}
          requestCounts={this.props.requestCounts}
          errorMessages={this.props.errorMessages}
        />
        <Layout className="textRight">
          <Button buttonStyle="primary" onClick={this.props.onCancel}>
            <FormattedMessage id="stripes-core.button.close" />
          </Button>
        </Layout>
      </div>
    );
  }
}

export default BulkRenewInfo;
