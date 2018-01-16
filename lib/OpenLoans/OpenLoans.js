import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import moment from 'moment'; // eslint-disable-line import/no-extraneous-dependencies
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import Button from '@folio/stripes-components/lib/Button';
import { UncontrolledDropdown } from '@folio/stripes-components/lib/Dropdown';
import MenuItem from '@folio/stripes-components/lib/MenuItem';
import DropdownMenu from '@folio/stripes-components/lib/DropdownMenu';
import Label from '../Label';
import { formatDate, formatDateTime } from '../../util';
import css from './OpenLoans.css';

const sortMap = {
  title: loan => _.get(loan, ['item', 'title']),
  barcode: loan => _.get(loan, ['item', 'barcode']),
  'Item Status': loan => _.get(loan, ['item', 'status', 'name'], ''),
  'Loan Date': loan => loan.loanDate,
  'Due Date': loan => loan.dueDate,
  renewals: loan => loan.renewalCount,
};

class OpenLoans extends React.Component {

  static propTypes = {
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
      sortOrder: ['title', 'barcode'],
      sortDirection: ['asc', 'asc'],
    };
  }

  onRowClick(e, row) {
    if (e.target.type !== 'button') {
      this.props.onClickViewLoanActionsHistory(e, row);
    }
  }

  onSort(e, meta) {
    if (!sortMap[meta.alias]) return;

    let { sortOrder, sortDirection } = this.state;

    if (sortOrder[0] !== meta.alias) {
      sortOrder = [meta.alias, sortOrder[0]];
      sortDirection = ['asc', sortDirection[0]];
    } else {
      const direction = (sortDirection[0] === 'desc') ? 'asc' : 'desc';
      sortDirection = [direction, sortDirection[1]];
    }

    this.setState({ ...this.state, sortOrder, sortDirection });
  }

  // http://localhost:9130/inventory/items?query=(barcode==5860825104574)

  getLoansFormatter() {
    const checkedLoans = this.state.checkedLoans;
    const loanTitleFormatter = (loan, label) =>
      <Link to={`/items/view/${loan.itemId}`}>{label}</Link>
      ;

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
      loanDate: loan => formatDate(loan.loanDate),
      dueDate: loan => formatDateTime(loan.dueDate),
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

  details(loan, e) {
    this.props.onClickViewLoanActionsHistory(e, loan);
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
      this[key.action](key.loan, e);
    }
  }

  renderActions(loan) {
    return (
      <UncontrolledDropdown
        onSelectItem={this.handleOptionsChange}
      >
        <Button data-role="toggle" buttonStyle="hover dropdownActive"><strong>•••</strong></Button>
        <DropdownMenu data-role="menu" overrideStyle={{ padding: '6px 0' }}>
          <MenuItem itemMeta={{ loan, action: 'details' }}>
            <Button buttonStyle="dropdownItem">Loan details</Button>
          </MenuItem>
          <MenuItem itemMeta={{ loan, action: 'renew' }}>
            <Button buttonStyle="dropdownItem">Renew</Button>
          </MenuItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  }

  renderSubHeader() {
    const checkedLoans = this.state.checkedLoans;

    let stringToolTip = 'Renew';
    const isDisabled = _.size(checkedLoans) === 0;

    if (isDisabled) {
      stringToolTip = 'Multiple loans can be processed at the same time. Please select loans first.';
    }

    return (
      <div style={{ padding: '15px 15px 0' }}>
        <Row>
          <Col xs={2}>
            <Label>{this.props.loans.length} Records found</Label>
          </Col>
          <Col xs={10}>
            <Button id="renew-all" disabled={isDisabled} title={stringToolTip} onClick={this.renewAll}>Renew</Button>
          </Col>
        </Row>
      </div>
    );
  }

  render() {
    const { sortOrder, sortDirection, allChecked } = this.state;
    const visibleColumns = ['  ', 'title', 'itemStatus', 'barcode', 'loanDate', 'dueDate', 'renewals', ' '];
    const columnMapping = {
      '  ': (<input type="checkbox" checked={allChecked} name="check-all" onChange={this.toggleAll} />),
      loanDate: 'Loan Date',
      dueDate: 'Due Date',
      itemStatus: 'Item Status',
    };


    const loans = _.orderBy(this.props.loans,
      [sortMap[sortOrder[0]], sortMap[sortOrder[1]]], sortDirection);

    return (
      <div className={css.root}>
        {this.props.loans.length > 0 && this.renderSubHeader()}
        <MultiColumnList
          id="list-loanshistory"
          fullWidth
          formatter={this.getLoansFormatter()}
          columnWidths={{ '  ': 28, barcode: 150, title: 350 }}
          visibleColumns={visibleColumns}
          columnMapping={columnMapping}
          columnOverflow={{ ' ': true }}
          onHeaderClick={this.onSort}
          sortOrder={sortOrder[0]}
          sortDirection={`${sortDirection[0]}ending`}
          contentData={loans}
          autosize
          virtualize
          interactive={false}
        />
      </div>
    );
  }
}

export default OpenLoans;
