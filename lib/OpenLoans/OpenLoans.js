import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
// import { DropdownButton, MenuItem, Row, Col } from 'react-bootstrap';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import Button from '@folio/stripes-components/lib/Button';
import { UncontrolledDropdown } from '@folio/stripes-components/lib/Dropdown';
import MenuItem from '@folio/stripes-components/lib/MenuItem';
import DropdownMenu from '@folio/stripes-components/lib/DropdownMenu';

import Label from '../Label';
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
    if (key.action && this[key.action]) {
      this[key.action](key.loan);
    }
  }

  renderActions(loan) {
    return (
      <UncontrolledDropdown
        onSelectItem={this.handleOptionsChange}
      >
        <Button data-role='toggle' buttonStyle='hover dropdownActive'><strong>•••</strong></Button>
        <DropdownMenu data-role='menu' overrideStyle={{padding: '6px 0'}}>
          <MenuItem itemMeta={{ loan, action: 'renew' }}>
            <Button buttonStyle='dropdownItem'>Renew</Button>
          </MenuItem>
        </DropdownMenu>
      </UncontrolledDropdown>
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
