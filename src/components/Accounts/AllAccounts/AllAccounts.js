import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  intlShape,
  FormattedTime,
  FormattedDate,
} from 'react-intl';
import {
  Row,
  Col,
  Button,
  MultiColumnList,
  UncontrolledDropdown,
  DropdownMenu,
  Popover,
  MenuItem,
} from '@folio/stripes/components';


class AllAccounts extends React.Component {
  static propTypes = {
    resources: PropTypes.shape({
      comments: PropTypes.object,
    }),
    user: PropTypes.object,
    mutator: PropTypes.shape({
      activeRecord: PropTypes.object,
    }),
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func,
    }),
    onChangeSelected: PropTypes.func.isRequired,
    visibleColumns: PropTypes.arrayOf(PropTypes.string),
    loans: PropTypes.arrayOf(PropTypes.object),
    onClickViewAccountActionsHistory: PropTypes.func.isRequired,
    onClickViewLoanActionsHistory: PropTypes.func.isRequired,
    accounts: PropTypes.arrayOf(PropTypes.object),
    selectedAccounts: PropTypes.arrayOf(PropTypes.object),
    onChangeActions: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
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
      'metadata.createdDate': f => (f.metadata || {}).createdDate,
      'metadata.updatedDate': f => (f.metadata || {}).updatedDate,
      'feeFineType': f => f.feeFineType,
      'amount': f => f.amount,
      'remaining': f => f.remaining,
      'paymentStatus.name': f => (f.paymentStatus || {}).name,
      'feeFineOwner': f => f.feeFineOwner,
      'title': f => f.title,
      'barcode': f => f.barcode,
      'callNumber': f => f.callNumber,
      'dueDate': f => f.dueDate,
      'returnedDate': f => f.returnedDate,
    };

    this.state = {
      allChecked: false,
      sortOrder: [
        'metadata.createdDate',
        'metadata.createdDate',
      ],
      sortDirection: ['desc', 'desc'],
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
    const selAccounts = this.props.selectedAccounts || [];
    const nextSelAccounts = nextProps.selectedAccounts || [];
    if (!_.isEqual(selAccounts, nextSelAccounts)) {
      const allChecked = nextSelAccounts.length === this.props.accounts.length;
      this.setState({ allChecked });
    }
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
    if (!this.sortMap[meta.name]) return;

    let { sortOrder, sortDirection } = this.state;

    if (sortOrder[0] !== meta.name) {
      sortOrder = [meta.name, sortOrder[1]];
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
    const myComments = actions.filter(a => a.comments).map(a => a.comments);
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
                    <FormattedMessage id="ui-users.accounts.history.comment" />
                    {' '}
                    {n}
                    {' '}
                    <FormattedMessage id="ui-users.accounts.history.of" />
                    {' '}
                    {n}
                    {':'}
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
    const accounts = this.props.selectedAccounts;

    return {
      '  ': f => (
        <input
          checked={accounts.find(a => a.id === f.id)}
          onClick={e => this.toggleItem(e, f)}
          type="checkbox"
        />
      ),
      'metadata.createdDate': f => (f.metadata ? <FormattedDate value={f.metadata.createdDate} /> : '-'),
      'metadata.updatedDate': f => (f.metadata && f.metadata.createdDate !== f.metadata.updatedDate ? <FormattedDate value={f.metadata.updatedDate} /> : '-'),
      'feeFineType': f => (f.feeFineType ? this.comments(f) : '-'),
      'amount': f => (f.amount ? parseFloat(f.amount).toFixed(2) : '-'),
      'remaining': f => parseFloat(f.remaining).toFixed(2) || '0.00',
      'paymentStatus.name': f => (f.paymentStatus || {}).name || '-',
      'feeFineOwner': f => (f.feeFineOwner ? f.feeFineOwner : '-'),
      'title': f => (f.title ? `${f.title} (${f.materialType})` : '-'),
      'barcode': f => (f.barcode ? f.barcode : '-'),
      'callNumber': f => (f.callNumber ? f.callNumber : '-'),
      'dueDate': f => (f.dueDate ? this.formatDateTime(f.dueDate) : '-'),
      'returnedDate': f => (this.getLoan(f).returnDate ? this.formatDateTime(this.getLoan(f).returnDate) : '-'),
      ' ': f => this.renderActions(f),
    };
  }

  toggleItem(e, account) {
    e.stopPropagation();
    const id = account.id;
    const accounts = this.props.selectedAccounts || [];
    const checked = {};
    accounts.forEach(a => {
      checked[a.id] = a;
    });
    const checkedAccounts = (checked[id])
      ? _.omit(checked, id)
      : { ...checked, [id]: account };
    const allChecked = _.size(checkedAccounts) === this.props.accounts.length;
    this.setState({ allChecked });

    const values = Object.values(checkedAccounts) || [];
    let selected = 0;
    values.forEach((v) => {
      selected += v.remaining;
    });

    this.props.onChangeSelected(parseFloat(selected).toFixed(2), values);
    const closed = values.filter(v => (v.status || {}).name === 'Closed');
    const open = values.filter(v => (v.status || {}).name === 'Open');

    if (closed.length > 0 && open.length === 0) {
      this.props.onChangeActions({
        waive: false,
        transfer: false,
        refund: true,
        regularpayment: false,
      });
    } else if (values.length !== 0) {
      this.props.onChangeActions({
        waive: true,
        transfer: true,
        refund: true,
        regularpayment: true,
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
    let selected = 0;
    values.forEach((v) => {
      selected += v.remaining;
    });

    this.props.onChangeSelected(parseFloat(selected).toFixed(2), values);

    if (values.length !== 0) {
      this.props.onChangeActions({
        waive: true,
        transfer: true,
        refund: true,
        regularpayment: true,
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

  loanDetails(a, e) {
    this.props.onClickViewLoanActionsHistory(e, { id: a.loanId });
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

  transfer(a, e) {
    if (e) e.preventDefault();
    this.props.onChangeActions({
      transferModal: true,
    }, [a]);
  }

  renderActions(a) {
    const disabled = (a.status.name === 'Closed');
    const elipsis = {
      pay: disabled,
      waive: disabled,
      transfer: disabled,
      error: disabled,
      loan: (a.loanId === '0' || !a.loanId),
    };
    const buttonDisabled = !this.props.stripes.hasPerm('ui-users.feesfines.actions.all');

    return (
      <UncontrolledDropdown
        onSelectItem={this.handleOptionsChange}
      >
        <Button data-role="toggle" buttonStyle="hover dropdownActive">
          <strong>•••</strong>
        </Button>
        <DropdownMenu data-role="menu" overrideStyle={{ padding: '7px 3px' }}>
          <MenuItem itemMeta={{ a, action: 'pay' }}>
            <Button disabled={!((elipsis.pay === false) && (buttonDisabled === false))} buttonStyle="dropdownItem">
              <FormattedMessage id="ui-users.accounts.history.button.pay" />
            </Button>
          </MenuItem>
          <MenuItem itemMeta={{ a, action: 'waive' }}>
            <Button disabled={!((elipsis.waive === false) && (buttonDisabled === false))} buttonStyle="dropdownItem">
              <FormattedMessage id="ui-users.accounts.history.button.waive" />
            </Button>
          </MenuItem>
          <MenuItem>
            <Button disabled buttonStyle="dropdownItem">
              <FormattedMessage id="ui-users.accounts.history.button.refund" />
            </Button>
          </MenuItem>
          <MenuItem itemMeta={{ a, action: 'transfer' }}>
            <Button disabled={!((elipsis.transfer === false) && (buttonDisabled === false))} buttonStyle="dropdownItem">
              <FormattedMessage id="ui-users.accounts.history.button.transfer" />
            </Button>
          </MenuItem>
          <MenuItem itemMeta={{ a, action: 'cancel' }}>
            <Button disabled={!((elipsis.error === false) && (buttonDisabled === false))} buttonStyle="dropdownItem">
              <FormattedMessage id="ui-users.accounts.button.error" />
            </Button>
          </MenuItem>
          <hr />
          <MenuItem itemMeta={{ a, action: 'loanDetails' }}>
            <Button disabled={elipsis.loan} buttonStyle="dropdownItem">
              <FormattedMessage id="ui-users.accounts.history.button.loanDetails" />
            </Button>
          </MenuItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  }

  render() {
    const { sortOrder, sortDirection, allChecked } = this.state;
    const props = this.props;

    const fees = _.orderBy(props.accounts, [this.sortMap[sortOrder[0]], this.sortMap[sortOrder[1]]], sortDirection);
    const { intl } = this.props;

    const columnMapping = {
      '  ': (<input id="checkbox" type="checkbox" checked={allChecked} name="check-all" onChange={this.toggleAll} />),
      'metadata.createdDate': intl.formatMessage({ id: 'ui-users.accounts.history.columns.created' }),
      'metadata.updatedDate': intl.formatMessage({ id: 'ui-users.accounts.history.columns.updated' }),
      'feeFineType': intl.formatMessage({ id: 'ui-users.accounts.history.columns.type' }),
      'amount': intl.formatMessage({ id: 'ui-users.accounts.history.columns.amount' }),
      'remaining': intl.formatMessage({ id: 'ui-users.accounts.history.columns.remaining' }),
      'paymentStatus.name': intl.formatMessage({ id: 'ui-users.accounts.history.columns.status' }),
      'feeFineOwner': intl.formatMessage({ id: 'ui-users.accounts.history.columns.owner' }),
      'title': intl.formatMessage({ id: 'ui-users.accounts.history.columns.title' }),
      'barcode': intl.formatMessage({ id: 'ui-users.accounts.history.columns.barcode' }),
      'callNumber': intl.formatMessage({ id: 'ui-users.accounts.history.columns.number' }),
      'dueDate': intl.formatMessage({ id: 'ui-users.accounts.history.columns.due' }),
      'returnedDate': intl.formatMessage({ id: 'ui-users.accounts.history.columns.returned' }),
    };

    return (
      <MultiColumnList
        id="list-accountshistory-all"
        formatter={this.getAccountsFormatter()}
        columnMapping={columnMapping}
        columnWidths={{
          '  ': 35,
          'metadata.createdDate': 110,
          'metadata.updatedDate': 110,
          'feeFineType': 180,
          'amount': 110,
          'remaining': 110,
          'paymentStatus.name': 110,
          'feeFineOwner': 110,
          'title': 250,
          'barcode': 110,
          'callNumber': 110,
          'dueDate': 110,
          'returnedDate': 110,
          ' ': 50
        }}
        visibleColumns={this.props.visibleColumns}
        fullWidth
        contentData={fees}
        onHeaderClick={this.onSort}
        onRowClick={this.onRowClick}
        sortOrder={sortOrder[0]}
        sortDirection={`${sortDirection[0]}ending`}
      />
    );
  }
}

export default AllAccounts;
