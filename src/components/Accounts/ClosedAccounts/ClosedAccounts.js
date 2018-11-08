import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Row,
  Col,
  MultiColumnList,
  UncontrolledDropdown,
  MenuItem,
  DropdownMenu,
  Popover,
} from '@folio/stripes/components';

import {
  FormattedMessage,
  FormattedTime,
  FormattedDate,
} from 'react-intl';

class ClosedAccounts extends React.Component {
  static manifest = Object.freeze({
    comments: {
      type: 'okapi',
      records: 'feefineactions',
      path: 'feefineactions?query=(userId=%{activeRecord.userId} and comments=*)&limit=200',
    },
    activeRecord: {},
  });

  static propTypes = {
    accounts: PropTypes.arrayOf(PropTypes.object),
    resources: PropTypes.shape({
      comments: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    mutator: PropTypes.shape({
      activeRecord: PropTypes.object,
    }),
    user: PropTypes.object,
    onChangeActions: PropTypes.func.isRequired,
    onClickViewAccountActionsHistory: PropTypes.func.isRequired,
    loans: PropTypes.arrayOf(PropTypes.object),
    onClickViewLoanActionsHistory: PropTypes.func.isRequired,
    visibleColumns: PropTypes.arrayOf(PropTypes.string),
  };

  constructor(props) {
    super(props);

    this.onSort = this.onSort.bind(this);
    this.toggleAll = this.toggleAll.bind(this);
    this.handleOptionsChange = this.handleOptionsChange.bind(this);
    this.comments = this.comments.bind(this);
    this.onRowClick = this.onRowClick.bind(this);
    this.getLoan = this.getLoan.bind(this);

    this.sortMap = {
      [<FormattedMessage id="ui-users.accounts.history.columns.created" />]: f => (f.metadata || {}).createdDate,
      [<FormattedMessage id="ui-users.accounts.history.columns.updated" />]: f => (f.metadata || {}).updatedDate,
      [<FormattedMessage id="ui-users.accounts.history.columns.type" />]: f => f.feeFineType,
      [<FormattedMessage id="ui-users.accounts.history.columns.amount" />]: f => f.amount,
      [<FormattedMessage id="ui-users.accounts.history.columns.remaining" />]: f => f.remaining,
      [<FormattedMessage id="ui-users.accounts.history.columns.status" />]: f => (f.paymentStatus || {}).name,
      [<FormattedMessage id="ui-users.accounts.history.columns.owner" />]: f => f.feeFineOwner,
      [<FormattedMessage id="ui-users.accounts.history.columns.title" />]: f => f.title,
      [<FormattedMessage id="ui-users.accounts.history.columns.barcode" />]: f => f.barcode,
      [<FormattedMessage id="ui-users.accounts.history.columns.number" />]: f => f.callNumber,
      [<FormattedMessage id="ui-users.accounts.history.columns.due" />]: f => f.dueDate,
      [<FormattedMessage id="ui-users.accounts.history.columns.returned" />]: f => f.returnedDate,
    };

    this.state = {
      checkedAccounts: {},
      allChecked: false,
      sortOrder: [
        <FormattedMessage id="ui-users.accounts.history.columns.created" />,
        <FormattedMessage id="ui-users.accounts.history.columns.updated" />,
        <FormattedMessage id="ui-users.accounts.history.columns.type" />,
        <FormattedMessage id="ui-users.accounts.history.columns.amount" />,
        <FormattedMessage id="ui-users.accounts.history.columns.remaining" />,
        <FormattedMessage id="ui-users.accounts.history.columns.status" />,
        <FormattedMessage id="ui-users.accounts.history.columns.owner" />,
        <FormattedMessage id="ui-users.accounts.history.columns.title" />,
        <FormattedMessage id="ui-users.accounts.history.columns.barcode" />,
        <FormattedMessage id="ui-users.accounts.history.columns.number" />,
        <FormattedMessage id="ui-users.accounts.history.columns.due" />,
        <FormattedMessage id="ui-users.accounts.history.columns.returned" />,
      ],
      sortDirection: ['asc', 'asc'],
    };
  }

  componentDidMount() {
    const user = this.props.user || {};
    this.props.mutator.activeRecord.update({ userId: user.id });
  }

  shouldComponentUpdate(nextProps, nextState) {
    const props = this.props;
    const comments = _.get(props.resources, ['comments', 'records'], []);
    const nextComments = _.get(nextProps.resources, ['comments', 'records'], []);
    const visibleColumns = this.props.visibleColumns;
    const nextVisibleColumns = nextProps.visibleColumns;
    return visibleColumns !== nextVisibleColumns || comments !== nextComments ||
      props.accounts !== nextProps.accounts ||
      this.state !== nextState;
  }

  onRowClick(e, row) {
    if ((e.target.type !== 'button') && (e.target.tagName !== 'IMG')) {
      this.props.onClickViewAccountActionsHistory(e, row);
    }
  }

  onSort(e, meta) {
    if (!this.sortMap[meta.alias]) return;

    let { sortOrder, sortDirection } = this.state;

    if (sortOrder[0] !== meta.alias) {
      sortOrder = [meta.alias, sortOrder[1]];
      sortDirection = ['asc', sortDirection[1]];
    } else {
      const direction = (sortDirection[0] === 'desc') ? 'asc' : 'desc';
      sortDirection = [direction, sortDirection[1]];
    }

    this.setState({ sortOrder, sortDirection });
  }

  comments(f) {
    const t = f.feeFineType ? f.feeFineType : '';
    const comments = _.get(this.props.resources, ['comments', 'records'], []);
    const actions = _.orderBy(comments.filter(c => c.accountId === f.id), ['dateAction'], ['asc']);
    const myComments = actions.filter(a => a.comments !== undefined).map(a => a.comments);
    const n = myComments.length;
    return (
      <div>
        <Row>
          <Col>{t}</Col>
          {(n > 0) ?
            <Col style={{ marginLeft: '5px' }}>
              <Popover>
                <div data-role="target">
                  <img src="https://png.icons8.com/color/18/000000/note.png" alt="" />
                </div>
                <p data-role="popover">
                  <b>
Comment
                    {n}
                    {' '}
of
                    {n}
                  </b>
                  {' '}
                  {myComments[n - 1]}
                  {' '}
                  <a href="/users/123" className="active">Go to details</a>
                </p>
              </Popover>
            </Col>
            : ' '}
        </Row>
      </div>
    );
  }

  getLoan(f) {
    const loan = this.props.loans.find(l => l.id === f.loanId) || {};
    return loan;
  }

  formatDateTime(dateTimeStr) {
    return <FormattedTime
      value={dateTimeStr}
      day="numeric"
      month="numeric"
      year="numeric"
    />;
  }

  getAccountsFormatter() {
    const checkedAccounts = this.state.checkedAccounts;

    return {
      '  ': f => (
        <input
          checked={!!(checkedAccounts[f.id])}
          onClick={e => this.toggleItem(e, f)}
          type="checkbox"
        />
      ),
      'date created': f => (f.metadata ? <FormattedDate value={f.metadata.createdDate} /> : '-'),
      'date updated': f => (f.metadata && f.metadata.createdDate !== f.metadata.updatedDate ? <FormattedDate value={f.metadata.updatedDate} /> : '-'),
      'fee/fine type': f => (f.feeFineType ? this.comments(f) : '-'),
      'billed': f => (f.amount ? parseFloat(f.amount).toFixed(2) : '-'),
      'remaining': f => parseFloat(f.remaining).toFixed(2) || '0.00',
      'payment status': f => (f.paymentStatus || {}).name || '-',
      'fee/fine owner': f => (f.feeFineOwner ? f.feeFineOwner : '-'),
      'instance (item type)': f => (f.title ? `${f.title}(${f.materialType})` : '-'),
      'barcode': f => (f.barcode ? f.barcode : '-'),
      'call number': f => (f.callNumber ? f.callNumber : '-'),
      'due date': f => (f.dueDate ? this.formatDateTime(f.dueDate) : '-'),
      'returned date': f => (f.returnedDate ? this.formatDateTime(f.returnedDate) : this.formatDateTime(this.getLoan(f).returnDate) || '-'),
      ' ': f => this.renderActions(f),
    };
  }

  toggleItem(e, a) {
    e.stopPropagation();
    const id = a.id;
    const accounts = this.state.checkedAccounts;
    const checkedAccounts = (accounts[id])
      ? _.omit(accounts, id)
      : { ...accounts, [id]: a };
    const allChecked = _.size(checkedAccounts) === this.props.accounts.length;
    this.setState({ checkedAccounts, allChecked });

    const values = Object.values(checkedAccounts) || [];

    if (values.length !== 0) {
      this.props.onChangeActions({
        refund: true,
      });
    } else {
      this.props.onChangeActions({
        waive: false,
        transfer: false,
        refund: false,
        regularpayment: false,
      });
    }
  }

  toggleAll(e) {
    const accounts = this.props.accounts;
    const checkedAccounts = (e.target.checked)
      ? accounts.reduce((memo, a) => (Object.assign(memo, { [a.id]: a })), {})
      : {};

    const values = Object.values(checkedAccounts) || [];

    if (values.length !== 0) {
      this.props.onChangeActions({
        refund: true,
      });
    } else {
      this.props.onChangeActions({
        waive: false,
        transfer: false,
        refund: false,
        regularpayment: false,
      });
    }

    this.setState(({ allChecked }) => ({
      allChecked: !allChecked,
      checkedAccounts
    }));
  }

  handleOptionsChange(itemMeta, e) {
    e.preventDefault();
    e.stopPropagation();

    const { a, action } = itemMeta;

    if (action && this[action]) {
      this[action](a);
    }
  }

  pay(a, e) {
    if (e) e.preventDefault();
    this.props.onChangeActions({
      pay: true,
    }, [a]);
  }

  cancel(a, e) {
    if (e) e.preventDefault();
    this.props.onChangeActions({
      cancellation: true,
    }, [a]);
  }

  waive(a, e) {
    if (e) e.preventDefault();
    this.props.onChangeActions({
      waiveModal: true,
    }, [a]);
  }

  loanDetails(a, e) {
    this.props.onClickViewLoanActionsHistory(e, { id: a.loanId });
  }

  renderActions(a) {
    const disabled = (a.loanId === '0' || !a.loanId);
    return (
      <UncontrolledDropdown
        onSelectItem={this.handleOptionsChange}
      >
        <Button data-role="toggle" buttonStyle="hover dropdownActive"><strong>•••</strong></Button>
        <DropdownMenu data-role="menu" overrideStyle={{ padding: '6px 0' }}>
          <MenuItem itemMeta={{ a, action: 'pay' }}>
            <Button disabled buttonStyle="dropdownItem">Pay</Button>
          </MenuItem>
          <MenuItem itemMeta={{ a, action: 'waive' }}>
            <Button disabled buttonStyle="dropdownItem">Waive</Button>
          </MenuItem>
          <MenuItem>
            <Button disabled buttonStyle="dropdownItem">Refund</Button>
          </MenuItem>
          <MenuItem>
            <Button disabled buttonStyle="dropdownItem">Transfer</Button>
          </MenuItem>
          <MenuItem itemMeta={{ a, action: 'cancel' }}>
            <Button disabled buttonStyle="dropdownItem">Error</Button>
          </MenuItem>
          <hr />
          <MenuItem itemMeta={{ a, action: 'loanDetails' }}>
            <Button disabled={disabled} buttonStyle="dropdownItem">Loan details</Button>
          </MenuItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  }

  render() {
    const { sortOrder, sortDirection, allChecked } = this.state;
    const props = this.props;
    const fees = _.orderBy(props.accounts, [this.sortMap[sortOrder[0]], this.sortMap[sortOrder[1]]], sortDirection);
    const columnMapping = {
      '  ': (<input type="checkbox" checked={allChecked} name="check-all" onChange={this.toggleAll} />),
    };

    return (
      <div>
        <MultiColumnList
          id="list-accountshistory"
          formatter={this.getAccountsFormatter()}
          columnMapping={columnMapping}
          columnWidths={{ '  ': 28, 'date created': 110, 'fee/fine type': 200, 'date updated': 110, 'due date': 110, 'returned date': 110 }}
          visibleColumns={this.props.visibleColumns}
          fullWidth
          contentData={fees}
          onHeaderClick={this.onSort}
          sortOrder={sortOrder[0]}
          sortDirection={`${sortDirection[0]}ending`}
          onRowClick={this.onRowClick}
        />
      </div>
    );
  }
}

export default ClosedAccounts;
