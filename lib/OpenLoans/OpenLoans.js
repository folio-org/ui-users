import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import dateFormat from 'dateformat';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import Button from '@folio/stripes-components/lib/Button';

import { formatDate, formatDateTime } from '../../util';
import css from './OpenLoans.css';

class OpenLoans extends React.Component {

  static propTypes = {
    stripes: PropTypes.shape({
      locale: PropTypes.string.isRequired,
    }).isRequired,
    history: PropTypes.object.isRequired,

    mutator: React.PropTypes.shape({
      loanId: PropTypes.shape({
        replace: PropTypes.func,
      }),
      loansHistory: React.PropTypes.shape({
        PUT: React.PropTypes.func.isRequired,
      }),
    }),
    onClickViewLoanActionsHistory: PropTypes.func.isRequired,
    loans: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  };

  static manifest = Object.freeze({
    loanId: {},
    loansHistory: {
      fetch: false,
      type: 'okapi',
      PUT: {
        path: 'circulation/loans/%{loanId}',
      },
    },
  });

  constructor(props) {
    super(props);

    this.handleOptionsChange = this.handleOptionsChange.bind(this);
    this.onRowClick = this.onRowClick.bind(this);
    this.toggleAll = this.toggleAll.bind(this);
    this.renewAll = this.renewAll.bind(this);

    this.state = { checkedLoans: {}, allChecked: false };
  }

  onRowClick(e, row) {
    if (e.target.type !== 'button') {
      this.props.onClickViewLoanActionsHistory(e, row);
    }
  }

  getLoansFormatter() {
    const stripes = this.props.stripes;
    const checkedLoans = this.state.checkedLoans;
    const loanTitleFormatter = (loan, label) => (
      <a
        href={`/items/view/${loan.itemId}`}
        onClick={e => this.goToItem(e, loan.itemId)}
      >{label}</a>
    );

    return {
      '  ': loan => (
        <input
          checked={!!(checkedLoans[loan.id])}
          onClick={e => this.toggleItem(e, loan)}
          type="checkbox"
        />
      ),
      title: loan => loanTitleFormatter(loan, _.get(loan, ['item', 'title'], '')),
      barcode: loan => loanTitleFormatter(loan, _.get(loan, ['item', 'barcode'], '')),
      itemStatus: loan => `${_.get(loan, ['item', 'status', 'name'], '')}`,
      loanDate: loan => formatDate(loan.loanDate, stripes.locale),
      dueDate: loan => (loan.dueDate ? formatDateTime(loan.dueDate, stripes.locale) : ''),
      renewals: loan => loan.renewalCount || 0,
      ' ': loan => this.renderActions(loan),
    };
  }

  toggleItem(e, loan) {
    e.stopPropagation();

    const id = loan.id;
    const loans = this.state.checkedLoans;
    const checkedLoans = (loans[id])
      ? _.omit(loans, id)
      : { ...loans, [id]: loan };
    const allChecked = _.size(checkedLoans) === this.props.loans.length;

    this.setState({ checkedLoans, allChecked });
  }

  toggleAll(e) {
    const loans = this.props.loans;
    const checkedLoans = (e.target.checked)
      ? loans.reduce((memo, loan) => (Object.assign(memo, { [loan.id]: loan })), {})
      : {};

    const allChecked = !this.state.allChecked;
    this.setState({ checkedLoans, allChecked });
  }

  goToItem(e, itemId) {
    this.props.history.push(`/items/view/${itemId}`);
    e.preventDefault();
  }

  renew(loan) {
    const loanDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(loanDate.getDate() + 30);

    Object.assign(loan, {
      renewalCount: (loan.renewalCount || 0) + 1,
      loanDate: dateFormat(loanDate, "yyyy-mm-dd'T'HH:MM:ss'Z'"),
      dueDate: dateFormat(dueDate, "yyyy-mm-dd'T'HH:MM:ss'Z'"),
      action: 'renewed',
    });

    this.props.mutator.loanId.replace(loan.id);
    this.props.mutator.loansHistory.PUT(_.omit(loan, ['item', 'rowIndex']));
    console.log('renewing..');
  }

  renewAll() {
    _.forIn(this.state.checkedLoans, loan => this.renew(loan));
    this.setState({ checkedLoans: {}, allChecked: false });
  }

  /**
   * change handler for the options-menu prevents the event from bubbling
   * up to the event handler attached to the row.
   */
  handleOptionsChange(key, e) {
    e.preventDefault();
    e.stopPropagation();

    if (key.action && this[key.action]) {
      this[key.action](key.loan);
    }
  }

  renderActions(loan) {
    return (
      <DropdownButton
        title="•••"
        id={`bg-nested-dropdown-${loan.id}`}
        noCaret
        pullRight
        onSelect={this.handleOptionsChange}
      >
        <MenuItem eventKey={{ loan, action: 'renew' }}>Renew</MenuItem>
      </DropdownButton>
    );
  }

  render() {
    const { checkedLoans, allChecked } = this.state;
    const visibleColumns = ['  ', 'title', 'itemStatus', 'barcode', 'loanDate', 'dueDate', 'renewals', ' '];
    const columnMapping = {
      '  ': (<input type="checkbox" checked={allChecked} name="check-all" onChange={this.toggleAll} />),
      loanDate: 'Loan Date',
      dueDate: 'Due Date',
      itemStatus: 'Item Status',
    };

    return (
      <div className={css.root}>
        <Button id="renew-all" disabled={_.size(checkedLoans) === 0} onClick={this.renewAll}>Renew</Button>
        <MultiColumnList
          id="list-loanshistory"
          fullWidth
          formatter={this.getLoansFormatter()}
          visibleColumns={visibleColumns}
          columnMapping={columnMapping}
          columnOverflow={{ ' ': true }}
          onRowClick={this.onRowClick}
          contentData={this.props.loans}
          autosize
          virtualize
        />
      </div>
    );
  }
}

export default OpenLoans;
