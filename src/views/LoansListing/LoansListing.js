import _ from 'lodash';
import React, { createRef } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Paneset,
  Pane,
  Button,
  ButtonGroup,
} from '@folio/stripes/components';

import { getFullName } from '../../components/util';
import { OpenLoans, ClosedLoans } from '../../components/Loans';
import css from './LoansListing.css';

/**
 * List a user's open or closed loans.
 *
 * Table-view of a user's loans, including links to the loan details and
 * the loan's item-record.
 */
class LoansListing extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    patronGroup: PropTypes.object.isRequired,
    loansHistory: PropTypes.arrayOf(PropTypes.object).isRequired,
    location: PropTypes.object,
    history: PropTypes.object,
    match: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.paneTitleRef = createRef();
  }

  componentDidMount() {
    if (this.paneTitleRef.current) {
      this.paneTitleRef.current.focus();
    }
  }

  /**
   * Segmented Control to swtich between open and closed loans
   */
  getSegmentedControls = () => {
    const {
      location,
      match: { params },
    } = this.props;

    const isLoanStatusOpen = params.loanstatus === 'open';
    const isLoanStatusClosed = params.loanstatus === 'closed';

    return (
      <ButtonGroup
        className={css.buttonGroupWrap}
        role="tablist"
      >
        <Button
          marginBottom0
          fullWidth
          id="loans-show-open"
          buttonStyle={isLoanStatusOpen ? 'primary' : 'default'}
          to={{
            pathname: `/users/${params.id}/loans/open`,
            state: location.state,
          }}
          replace
          role="tab"
          aria-selected={isLoanStatusOpen}
          aria-controls="open-loans-list-panel"
        >
          <FormattedMessage id="ui-users.loans.openLoans" />
        </Button>
        <Button
          marginBottom0
          fullWidth
          id="loans-show-closed"
          buttonStyle={isLoanStatusClosed ? 'primary' : 'default'}
          to={{
            pathname: `/users/${params.id}/loans/closed`,
            state: location.state,
          }}
          replace
          role="tab"
          aria-selected={isLoanStatusClosed}
          aria-controls="closed-loans-list-panel"
        >
          <FormattedMessage id="ui-users.loans.closedLoans" />
        </Button>
      </ButtonGroup>
    );
  }

  handleClose = () => {
    const {
      history,
      location,
      match: { params },
    } = this.props;

    history.push(`/users/preview/${params.id}${_.get(location, ['state', 'search'], '')}`);
  }

  render() {
    const {
      user,
      patronGroup,
      match: { params },
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
          onClose={this.handleClose}
          paneTitleRef={this.paneTitleRef}
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
      </Paneset>
    );
  }
}

export default LoansListing;
