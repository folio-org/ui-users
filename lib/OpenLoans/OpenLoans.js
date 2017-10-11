import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { DropdownButton, MenuItem, Row, Col } from 'react-bootstrap';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import Button from '@folio/stripes-components/lib/Button';

import Label from '../Label';
import { formatDate, formatDateTime } from '../../util';
import css from './OpenLoans.css';

const orderMap = {
  title: loan => _.get(loan, ['item', 'title']),
  barcode: loan => _.get(loan, ['item', 'barcode'])
};

class OpenLoans extends React.Component {

  static propTypes = {
    stripes: PropTypes.shape({
      locale: PropTypes.string.isRequired,
    }).isRequired,
    history: PropTypes.object.isRequired,
    mutator: PropTypes.shape({
      loanId: PropTypes.shape({
        replace: PropTypes.func,
      }),
      loansHistory: PropTypes.shape({
        PUT: PropTypes.func.isRequired,
      }),
    }),
    onClickViewLoanActionsHistory: PropTypes.func.isRequired,
    loans: PropTypes.arrayOf(PropTypes.object).isRequired,
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
    this.onSort = this.onSort.bind(this);

    this.state = {
      checkedLoans: {},
      allChecked: false,
      sortOrder: ['title' , 'barcode'],
      sortDirection: ['asc', 'asc']
    };
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
    this.setState({ ...this.state, checkedLoans, allChecked });
  }

  toggleAll(e) {
    const loans = this.props.loans;
    const checkedLoans = (e.target.checked)
      ? loans.reduce((memo, loan) => (Object.assign(memo, { [loan.id]: loan })), {})
      : {};

    const allChecked = !this.state.allChecked;
    this.setState({ ...this.state, checkedLoans, allChecked });
  }

  goToItem(e, itemId) {
    this.props.history.push(`/items/view/${itemId}`);
    e.preventDefault();
  }

  renew(loan) {
    Object.assign(loan, {
      renewalCount: (loan.renewalCount || 0) + 1,
      loanDate: moment().format(),
      dueDate: moment(loan.dueDate).add(30, 'days').format(),
      action: 'renewed',
    });

    this.props.mutator.loanId.replace(loan.id);
    this.props.mutator.loansHistory.PUT(_.omit(loan, ['item', 'rowIndex']));
  }

  onSort(e, meta) {
    const sortOrder = [meta.alias, this.state.sortOrder[0]];
    const direction = (this.state.sortDirection[0] == 'desc') ? 'asc' : 'desc';
    const sortDirection = [direction, direction];

    this.setState({ ...this.state, sortOrder, sortDirection });
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

  renderSubHeader() {
    const checkedLoans = this.state.checkedLoans;

    return (
      <Row>
        <Col xs={2}>
          <Label>{this.props.loans.length} Records found</Label>
        </Col>
        <Col xs={10}>
          <Button id="renew-all" disabled={_.size(checkedLoans) === 0} onClick={this.renewAll}>Renew</Button>
        </Col>
      </Row>
    );
  }

  render() {
    const allChecked = this.state.allChecked;
    const visibleColumns = ['  ', 'title', 'itemStatus', 'barcode', 'loanDate', 'dueDate', 'renewals', ' '];
    const columnMapping = {
      '  ': (<input type="checkbox" checked={allChecked} name="check-all" onChange={this.toggleAll} />),
      loanDate: 'Loan Date',
      dueDate: 'Due Date',
      itemStatus: 'Item Status',
    };

    const { sortOrder, sortDirection } = this.state;
    const loans = _.orderBy(this.props.loans,
      [orderMap[sortOrder[0]], orderMap[sortOrder[1]]],
      sortDirection);

    return (
      <div className={css.root}>
        {this.props.loans.length > 0 && this.renderSubHeader()}
        <MultiColumnList
          id="list-loanshistory"
          fullWidth
          formatter={this.getLoansFormatter()}
          columnWidths={{ '  ': 20, barcode: 150, title: 350 }}
          visibleColumns={visibleColumns}
          columnMapping={columnMapping}
          columnOverflow={{ ' ': true }}
          onHeaderClick={this.onSort}
          onRowClick={this.onRowClick}
          sortOrder={sortOrder[0]}
          sortDirection={`${sortDirection[0]}ending`}
          contentData={loans}
          autosize
          virtualize
        />
      </div>
    );
  }
}

export default OpenLoans;
