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

import { getFullName } from './util';
import { OpenLoans, ClosedLoans } from './components/Loans';
import css from './LoansHistory.css';

/**
 * List a user's open or closed loans.
 *
 * Table-view of a user's loans, including links to the loan details and
 * the loan's item-record.
 */
class LoansHistory extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
    onCancel: PropTypes.func.isRequired,
    openLoans: PropTypes.bool,
    onClickViewOpenLoans: PropTypes.func.isRequired,
    onClickViewClosedLoans: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    patronGroup: PropTypes.object.isRequired,
    loansHistory: PropTypes.arrayOf(PropTypes.object).isRequired,
  };

  constructor(props) {
    super(props);
    this.connectedOpenLoans = props.stripes.connect(OpenLoans);
    this.connectedClosedLoans = props.stripes.connect(ClosedLoans);
  }

  /**
   * Segmented Control to swtich between open and closed loans
   */
  getSegmentedControls = () => {
    const {
      openLoans,
      onClickViewOpenLoans,
      onClickViewClosedLoans,
    } = this.props;
    const onChange = ({ id }) => {
      if (id === 'loans-show-open') {
        onClickViewOpenLoans();
      } else {
        onClickViewClosedLoans();
      }
    };

    return (
      <ButtonGroup className={css.buttonGroupWrap}>
        <Button
          marginBottom0
          id="loans-show-open"
          buttonStyle={openLoans ? 'primary' : 'default'}
          onClick={() => onChange({ id: 'loans-show-open' })}
        >
          <FormattedMessage id="ui-users.loans.openLoans" />
        </Button>
        <Button
          marginBottom0
          id="loans-show-closed"
          buttonStyle={openLoans ? 'default' : 'primary'}
          onClick={() => onChange({ id: 'loans-show-closed' })}
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
      openLoans,
      loansHistory,
    } = this.props;
    const loanStatus = openLoans ? 'Open' : 'Closed';
    const loans = _.filter(loansHistory, loan => loanStatus === _.get(loan, ['status', 'name']));
    if (!loans) return <div />;

    return (
      <Paneset isRoot>
        <Pane
          padContent={false}
          id="pane-loanshistory"
          defaultWidth="100%"
          dismissible
          onClose={this.props.onCancel}
          paneTitle={(
            <FormattedMessage id="ui-users.loans.title">
              {(title) => `${title} - ${getFullName(user)} (${_.upperFirst(patronGroup.group)})`}
            </FormattedMessage>
          )}
        >
          { this.getSegmentedControls() }
          {
            openLoans
              ? <this.connectedOpenLoans loans={loans} {...this.props} />
              : <this.connectedClosedLoans loans={loans} {...this.props} />
          }
        </Pane>
      </Paneset>);
  }
}

export default LoansHistory;
