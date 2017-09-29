import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import dateFormat from 'dateformat';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import Checkbox from '@folio/stripes-components/lib/Checkbox';
import { Field, reduxForm } from 'redux-form';

import { formatDate, formatDateTime, getFullName } from '../../util';

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
    this.handleOptionsClick = this.handleOptionsClick.bind(this);
    this.onRowClick = this.onRowClick.bind(this);
    this.toggleAll = this.toggleAll.bind(this);
    this.toggleItem = this.toggleItem.bind(this);

    this.checkboxRefs = {};
    this.state = { checkedLoans: {} };
  }

  onRowClick(e, row) {
    if (e.target.type == 'checkbox') {
      this.toggleItem(e, row);
    } else {
      this.props.onClickViewLoanActionsHistory(e, row);
    }
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

  toggleItem(e, loan) {
    const id = loan.id;
    const loans = this.state.checkedLoans;
    const checkedLoans = (loans[id])
      ? _.omit(loans, id)
      : {...loans, [id]: loan };

    this.setState({ checkedLoans });
    // This is a hack to change checkbox visually
    // More info: https://github.com/facebook/react/issues/3005#issuecomment-72513965
    setTimeout(() => {
      this.checkboxRefs[id].checked = !!(checkedLoans[loan.id]);
    });
  }

  goToItem(e, itemId) {
    this.props.history.push(`/items/view/${itemId}`);
    e.preventDefault();
  }

  renderActions(loan) {
    return (
      <DropdownButton
        title="•••"
        id={`bg-nested-dropdown-${loan.id}`}
        noCaret
        pullRight onClick={this.handleOptionsClick}
        onSelect={this.handleOptionsChange}
      >
        <MenuItem eventKey={{ loan, action: 'renew' }}>Renew</MenuItem>
      </DropdownButton>
    );
  }

  toggleAll(e) {
    const loans = this.props.loans;
    const checkedLoans = (e.target.checked)
      ? loans.reduce((memo, loan) => (Object.assign(memo, { [loan.id]: loan })), {})
      : {};
    this.setState({ checkedLoans });
  }

  render() {
    const { loans, stripes } = this.props;
    const checkedLoans = this.state.checkedLoans;
    const loanTitleFormatter = (loan, label) => (
      <a
        href={`/items/view/${loan.itemId}`}
        onClick={e => this.goToItem(e, loan.itemId)}
      >{label}</a>
    );

    const loansFormatter = {
      '  ': loan => (
        <input
          checked={!!(checkedLoans[loan.id])}
          ref={input => this.checkboxRefs[loan.id] = input}
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

    const columnMapping = {
      '  ': (<input type="checkbox" name="check-all" onChange={this.toggleAll} />),
      loanDate: 'Loan Date',
      dueDate: 'Due Date',
      itemStatus: 'Item Status',
    };

    const visibleColumns = ['  ', 'title', 'itemStatus', 'barcode', 'loanDate', 'dueDate','renewals', ' '];

    return (
      <MultiColumnList
        id="list-loanshistory"
        fullWidth
        formatter={loansFormatter}
        visibleColumns={visibleColumns}
        columnMapping={columnMapping}
        columnOverflow={{ ' ': true }}
        onRowClick={this.onRowClick}
        contentData={loans}
        autosize
        virtualize
      />
    );
  }
}

export default OpenLoans;
