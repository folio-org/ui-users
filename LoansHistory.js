import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import Button from '@folio/stripes-components/lib/Button';
import SegmentedControl from '@folio/stripes-components/lib/SegmentedControl';

import { getFullName } from './util';
import { OpenLoans, ClosedLoans } from './lib/Loans';
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
      locale: PropTypes.string.isRequired,
      connect: PropTypes.func.isRequired,
      intl: PropTypes.object.isRequired,
    }).isRequired,
    resources: PropTypes.shape({
      loansHistory: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    onCancel: PropTypes.func.isRequired,
    openLoans: PropTypes.bool,
    onClickViewOpenLoans: PropTypes.func.isRequired,
    onClickViewClosedLoans: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    patronGroup: PropTypes.object.isRequired,
  };

  static manifest = Object.freeze({
    loansHistory: {
      type: 'okapi',
      records: 'loans',
      path: 'circulation/loans?query=(userId==!{user.id}) sortby id&limit=100',
    },
  });

  constructor(props) {
    super(props);
    this.connectedOpenLoans = props.stripes.connect(OpenLoans);
    this.connectedClosedLoans = props.stripes.connect(ClosedLoans);
  }

  /**
   * Segmented Control to swtich between open and closed loans
   */
  getSegmentedControls = () => {
    const { openLoans, stripes: { intl } } = this.props;
    const activeId = openLoans ? 'loans-show-open' : 'loans-show-closed';
    const onChange = ({ id }) => {
      if (id === 'loans-show-open') {
        this.props.onClickViewOpenLoans();
      } else {
        this.props.onClickViewClosedLoans();
      }
    };

    return (
      <div className={css.segmentedControlWrap}>
        <SegmentedControl className={css.segmentedControl} activeId={activeId} onActivate={onChange}>
          <Button marginBottom0 id="loans-show-open" title={intl.formatMessage({ id: 'ui-users.loans.openLoans' })} aria-label={intl.formatMessage({ id: 'ui-users.loans.openLoans' })}>{intl.formatMessage({ id: 'ui-users.loans.openLoans' })}</Button>
          <Button marginBottom0 id="loans-show-closed" title={intl.formatMessage({ id: 'ui-users.loans.closedLoans' })} aria-label={intl.formatMessage({ id: 'ui-users.loans.closedLoans' })}>{intl.formatMessage({ id: 'ui-users.loans.closedLoans' })}</Button>
        </SegmentedControl>
      </div>
    );
  }

  render() {
    const { user, patronGroup, resources, openLoans, stripes: { intl } } = this.props;
    const loansHistory = _.get(resources, ['loansHistory', 'records']);
    const loanStatus = openLoans ? intl.formatMessage({ id: 'ui-users.loans.open' }) : intl.formatMessage({ id: 'ui-users.loans.closed' });
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
          paneTitle={`${intl.formatMessage({ id: 'ui-users.loans.title' })} - ${getFullName(user)} (${_.upperFirst(patronGroup.group)})`}
        >
          { this.getSegmentedControls() }
          {openLoans
            ? (<this.connectedOpenLoans loans={loans} {...this.props} />)
            : (<this.connectedClosedLoans loans={loans} {...this.props} />)
          }
        </Pane>
      </Paneset>);
  }
}

export default LoansHistory;
