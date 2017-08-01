import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import Button from '@folio/stripes-components/lib/Button';
import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import dateFormat from 'dateformat';

import { formatDate } from './util';

class LoansHistory extends React.Component {

  static propTypes = {
    stripes: PropTypes.shape({
      locale: PropTypes.string.isRequired,
    }).isRequired,
    resources: PropTypes.shape({
      loansHistory: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    mutator: PropTypes.shape({
      loanId: PropTypes.shape({
        replace: PropTypes.func,
      }),
      loansHistory: PropTypes.shape({
        PUT: PropTypes.func.isRequired,
      }),
    }).isRequired,
    onCancel: PropTypes.func.isRequired,
    openLoans: PropTypes.bool,
    onClickViewLoanActionsHistory: PropTypes.func.isRequired,
    onClickViewOpenLoans: PropTypes.func.isRequired,
    onClickViewClosedLoans: PropTypes.func.isRequired,
  };

  static manifest = Object.freeze({
    loanId: {},
    loansHistory: {
      type: 'okapi',
      records: 'loans',
      path: 'circulation/loans?query=(userId=!{userid})',
      PUT: {
        path: 'circulation/loans/%{loanId}',
      },
    },
  });

  constructor(props) {
    super(props);

    this.handleOptionsChange = this.handleOptionsChange.bind(this);
    this.handleOptionsClick = this.handleOptionsClick.bind(this);
  }

  /**
   * change handler for the options-menu prevents the event from bubbling
   * up to the event handler attached to the row.
   */
   // eslint-disable-next-line class-methods-use-this
  handleOptionsChange(e, loan) {
    const action = e.target.value;

    if (action && this[action]) {
      this[action](loan);
    }

    e.preventDefault();
    e.stopPropagation();
  }

  renew(loan) {
    const loanDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(loanDate.getDate() + 30);

    Object.assign(loan, {
      renewalCount: (loan.renewalCount || 0) + 1,
      loanDate: dateFormat(loanDate, "yyyy-mm-dd'T'HH:MM:ss'Z'"),
      dueDate: dateFormat(dueDate, "yyyy-mm-dd'T'HH:MM:ss'Z'"),
    });

    const data = Object.assign(_.omit(loan, ['item', 'rowIndex']), {
      action: 'renewed',
    });

    this.props.mutator.loanId.replace(loan.id);
    this.props.mutator.loansHistory.PUT(data);
  }

  /**
   * click handler for the options-menu prevents the event from bubbling
   * up to the event handler attached to the row.
   */
   // eslint-disable-next-line class-methods-use-this
  handleOptionsClick(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  renderActions(loan) {
    return (
      <select onChange={e => this.handleOptionsChange(e, loan)} onClick={this.handleOptionsClick}>
        <option value="">•••</option>
        <option value="renew">Renew</option>
      </select>
    );
  }

  render() {
    const loansHistory = _.get(this.props.resources, ['loansHistory', 'records']);
    const loanStatus = this.props.openLoans ? 'Open' : 'Closed';
    const loans = _.filter(loansHistory, loan => loanStatus === _.get(loan, ['status', 'name']));
    if (!loans) return <div />;

    const historyLastMenu = (<PaneMenu>
      <Button title="Open Loans" aria-label="Open Loans" onClick={this.props.onClickViewOpenLoans}>Open Loans</Button>
      <Button title="Closed Loans" aria-label="Closed Loans" onClick={this.props.onClickViewClosedLoans}>Closed Loans</Button>
    </PaneMenu>);

    /*
     * loanTitleFormatter isn't currently in use, but apparently there's a use
     * case for having the cell content link to a different location than the
     * cell background. On a scale from 1 to WTF, I give this a 10, but I digress.
     * Note that both e.preventDefault() and e.stopPropagation() are required to
     * achieve this behavior.
     *
    const loanTitleFormatter = loan => (
      <a
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          this.props.doSomethingWithThisClick(e, loan);
        }}
      >{_.get(loan, ['item', 'title'], '')}</a>
    );

    const loansFormatter = {
      title: loanTitleFormatter,
      ...
    };
    */

    const loansFormatter = {
      title: loan => `${_.get(loan, ['item', 'title'], '')}`,
      barcode: loan => `${_.get(loan, ['item', 'barcode'], '')}`,
      status: loan => `${_.get(loan, ['status', 'name'], '')}`,
      loanDate: loan => formatDate(loan.loanDate, this.props.stripes.locale),
      dueDate: loan => (loan.dueDate ? formatDate(loan.dueDate, this.props.stripes.locale) : ''),
      renewals: loan => loan.renewalCount,
      returnDate: loan => (loan.returnDate ? formatDate(loan.returnDate, this.props.stripes.locale) : ''),
      ' ': loan => (_.get(loan, ['status', 'name'], '') !== 'Closed' && this.renderActions(loan)),
    };

    return (
      <Paneset isRoot>
        <Pane id="pane-loanshistory" defaultWidth="100%" lastMenu={historyLastMenu} dismissible onClose={this.props.onCancel} paneTitle="Loans">
          <MultiColumnList
            id="list-loanshistory"
            fullWidth
            formatter={loansFormatter}
            visibleColumns={['title', 'barcode', 'loanDate', 'dueDate', 'returnDate', 'status', 'renewals', ' ']}
            contentData={loans}
            onRowClick={this.props.onClickViewLoanActionsHistory}
          />
        </Pane>
      </Paneset>);
  }
}

export default LoansHistory;
