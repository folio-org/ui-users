import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import Button from '@folio/stripes-components/lib/Button';
import Icon from '@folio/stripes-components/lib/Icon';
import Layout from '@folio/stripes-components/lib/Layout';
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
    const iconAlignStyle = { display: 'flex', alignItems: 'center' };

    return (
      <div>
        <div style={iconAlignStyle}>
          { failedRenewals.length > 0 ?
            <span style={iconAlignStyle}>
              <Icon size="medium" icon="validation-error" color="red" />
              <SafeHTMLMessage
                id="ui-users.brd.itemNotRenewed"
                values={{
                  count: failedRenewals.length
                }}
              />
            </span>
              : null
            }
          { successRenewals.length > 0 ?
            <span style={iconAlignStyle}>
              <Icon size="medium" icon="validation-check" color="green" />
              <SafeHTMLMessage
                id="ui-users.brd.itemSuccessfullyRenewed"
                values={{
                  count: successRenewals.length
                }}
              />
            </span>
            : null
          }
        </div>
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
