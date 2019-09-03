import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Paneset,
  Pane,
  Button,
  ButtonGroup,
} from '@folio/stripes/components';

import { getFullName } from '../../util';
import { OpenLoans, ClosedLoans } from '../../Loans';
import css from './LoansListing.css';

/**
 * List a user's open or closed loans.
 *
 * Table-view of a user's loans, including links to the loan details and
 * the loan's item-record.
 */
class LoansListing extends React.Component {
  static propTypes = {
    // onCancel: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    patronGroup: PropTypes.object.isRequired,
    loansHistory: PropTypes.arrayOf(PropTypes.object).isRequired,
    location: PropTypes.object,
    history: PropTypes.object,
    match: PropTypes.object,
  };

  /**
   * Segmented Control to swtich between open and closed loans
   */
  getSegmentedControls = () => {
    const {
      match: { params },
    } = this.props;

    return (
      <ButtonGroup className={css.buttonGroupWrap}>
        <Button
          marginBottom0
          fullWidth
          id="loans-show-open"
          buttonStyle={params.loanstatus === 'open' ? 'primary' : 'default'}
          to={{ pathname: `/users/${params.id}/loans/open` }}
          replace
        >
          <FormattedMessage id="ui-users.loans.openLoans" />
        </Button>
        <Button
          marginBottom0
          fullWidth
          id="loans-show-closed"
          buttonStyle={params.loanstatus === 'closed' ? 'primary' : 'default'}
          to={{ pathname: `/users/${params.id}/loans/closed` }}
          replace
        >
          <FormattedMessage id="ui-users.loans.closedLoans" />
        </Button>
      </ButtonGroup>
    );
  }

  render() {
    const {
      user,
      patronGroup,
      match: { params },
      history,
      loansHistory,
    } = this.props;
    const loanStatus = params.loanstatus;
    const loans = _.filter(loansHistory, loan => loanStatus === _.get(loan, ['status', 'name']).toLowerCase());
    if (!loans) return <div />;

    return (
      <Paneset>
        <Pane
          padContent={false}
          id="pane-loanshistory"
          defaultWidth="100%"
          dismissible
          onClose={() => { history.goBack(); }}
          paneTitle={(
            <FormattedMessage id="ui-users.loans.title">
              {(title) => `${title} - ${getFullName(user)} (${_.upperFirst(patronGroup.group)})`}
            </FormattedMessage>
          )}
        >
          { this.getSegmentedControls() }
          {
            loanStatus === 'open' && (
              <OpenLoans {...this.props} loans={loans} />)
          }
          {
            loanStatus === 'closed' &&
              (<ClosedLoans {...this.props} loans={loans} />)
          }
        </Pane>
      </Paneset>);
  }
}

export default LoansListing;
