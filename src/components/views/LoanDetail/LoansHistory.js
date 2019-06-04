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

import { getFullName, handleBackLink } from '../../../util';
import { OpenLoans, ClosedLoans } from '../../Loans';
import css from './LoansHistory.css';

/**
 * List a user's open or closed loans.
 *
 * Table-view of a user's loans, including links to the loan details and
 * the loan's item-record.
 */
class LoansHistory extends React.Component {
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
      <div className={css.segmentedControlWrap}>
        <ButtonGroup className={css.segmentedControl}>
          <Button
            marginBottom0
            fullWidth
            id="loans-show-open"
            buttonStyle={params.loanstatus === 'open' ? 'primary' : 'default'}
            to={{ pathname: `/users/${params.id}/loans/open` }}
          >
            <FormattedMessage id="ui-users.loans.openLoans" />
          </Button>
          <Button
            marginBottom0
            fullWidth
            id="loans-show-closed"
            buttonStyle={params.loanstatus === 'closed' ? 'primary' : 'default'}
            to={{ pathname: `/users/${params.id}/loans/closed` }}
          >
            <FormattedMessage id="ui-users.loans.closedLoans" />
          </Button>
        </ButtonGroup>
      </div>
    );
  }

  render() {
    const {
      user,
      patronGroup,
      match: { params },
      location,
      history,
      loansHistory,
    } = this.props;
    const loanStatus = params.loanstatus;
    const loans = _.filter(loansHistory, loan => loanStatus === _.get(loan, ['status', 'name']));
    if (!loans) return <div />;

    return (
      <Paneset>
        <Pane
          padContent={false}
          id="pane-loanshistory"
          defaultWidth="100%"
          dismissible
          onClose={() => { handleBackLink(location, history); }}
          paneTitle={(
            <FormattedMessage id="ui-users.loans.title">
              {(title) => `${title} - ${getFullName(user)} (${_.upperFirst(patronGroup.group)})`}
            </FormattedMessage>
          )}
        >
          { this.getSegmentedControls() }
          {
            loanStatus === 'open' &&
              (<OpenLoans loans={loans} {...this.props} />)
          }
          {
            loanStatus === 'closed' &&
              (<ClosedLoans loans={loans} {...this.props} />)
          }
        </Pane>
      </Paneset>);
  }
}

export default LoansHistory;
