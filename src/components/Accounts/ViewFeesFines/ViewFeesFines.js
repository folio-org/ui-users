import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  MultiColumnList,
  Dropdown,
  MenuItem,
  DropdownMenu,
} from '@folio/stripes/components';

import {
  FormattedMessage,
  FormattedTime,
  FormattedDate,
} from 'react-intl';

import {
  calculateSortParams,
  nav,
} from '../../util';

import {
  isRefundAllowed,
  isCancelAllowed,
} from '../accountFunctions';

class ViewFeesFines extends React.Component {
  static propTypes = {
    resources: PropTypes.shape({
      comments: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      loans: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    mutator: PropTypes.shape({
      activeRecord: PropTypes.shape({
        update: PropTypes.func.isRequired,
      }),
    }).isRequired,
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func,
    }),
    onChangeActions: PropTypes.func.isRequired,
    onChangeSelected: PropTypes.func.isRequired,
    accounts: PropTypes.arrayOf(PropTypes.object),
    loans: PropTypes.arrayOf(PropTypes.object),
    match: PropTypes.object,
    history: PropTypes.object,
    user: PropTypes.object,
    visibleColumns: PropTypes.arrayOf(PropTypes.string),
    intl: PropTypes.object.isRequired,
    selectedAccounts: PropTypes.arrayOf(PropTypes.object),
  };

  constructor(props) {
    super(props);

    this.onSort = this.onSort.bind(this);
    this.toggleAll = this.toggleAll.bind(this);
    this.handleOptionsChange = this.handleOptionsChange.bind(this);
    this.getLoan = this.getLoan.bind(this);
    this.onRowClick = this.onRowClick.bind(this);

    this.sortMap = {
      'metadata.createdDate': f => f.metadata.createdDate,
      'metadata.updatedDate': f => f.metadata.updatedDate,
      'feeFineType': f => f.feeFineType,
      'amount': f => f.amount,
      'remaining': f => f.remaining,
      'paymentStatus.name': f => f.paymentStatus.name,
      'feeFineOwner': f => f.feeFineOwner,
      'title': f => f.title,
      'barcode': f => f.barcode,
      'number': f => f.callNumber,
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
    if (!_.isEqual(props.accounts, nextProps.accounts) && props.accounts.length > 0) {
      const checkedAccounts = _.intersection(nextProps.accounts, nextProps.selectedAccounts);
      const selected = checkedAccounts.reduce((s, { remaining }) => {
        return s + parseFloat(remaining);
      }, 0);
      this.props.onChangeSelected(parseFloat(selected).toFixed(2), checkedAccounts);
    }

    if (!_.isEqual(props.selectedAccounts, nextProps.selectedAccounts)) {
      const allChecked = _.size(nextProps.selectedAccounts) === nextProps.accounts.length;
      this.setState({ allChecked });
    }

    return visibleColumns !== nextVisibleColumns || comments !== nextComments ||
      props.accounts !== nextProps.accounts ||
      this.state !== nextState;
  }

  onRowClick(e, row) {
    const { history, match: { params } } = this.props;
    if ((e.target.type !== 'button') && (e.target.tagName !== 'IMG')) {
      nav.onClickViewAccountActionsHistory(e, row, history, params);
    }
  }

  onSort(e, meta) {
    if (!this.sortMap[meta.name]) return;

    const {
      sortOrder,
      sortDirection,
    } = this.state;

    this.setState(calculateSortParams({
      sortOrder,
      sortDirection,
      sortValue: meta.name,
      secondarySortOrderIndex: 1,
      secondarySortDirectionIndex: 1,
    }));
  }

  getLoan(f) {
    const { match: { params: { id } }, loans } = this.props;
    if (loans.length === 0 || !id || f.loanId === '0') return {};
    const res = loans.find(l => l.id === f.loanId) || {};
    return res;
  }

  formatTitle(item) {
    const {
      materialType,
      title,
    } = item;
    const instanceTypeString = materialType ? `(${materialType})` : '';

    return title ? `${title} ${instanceTypeString}` : '-';
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
          checked={(accounts.findIndex(a => a.id === f.id) !== -1)}
          onClick={e => this.toggleItem(e, f)}
          type="checkbox"
        />
      ),
      'metadata.createdDate': f => (f.metadata ? <FormattedDate value={f.metadata.createdDate} /> : '-'),
      'metadata.updatedDate': f => (f.metadata && f.metadata.createdDate !== f.metadata.updatedDate ? <FormattedDate value={f.metadata.updatedDate} /> : '-'),
      'feeFineType': f => (f.feeFineType ?? '-'),
      'amount': f => (f.amount ? parseFloat(f.amount).toFixed(2) : '-'),
      'remaining': f => parseFloat(f.remaining).toFixed(2) || '0.00',
      'paymentStatus.name': f => (f.paymentStatus || {}).name || '-',
      'feeFineOwner': f => (f.feeFineOwner ? f.feeFineOwner : '-'),
      'title': item => this.formatTitle(item),
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
    const values = Object.values(checkedAccounts);
    let selected = 0;
    values.forEach((v) => {
      selected += (v.remaining * 100);
    });

    selected /= 100;
    this.props.onChangeSelected(parseFloat(selected).toFixed(2), values);

    const open = selected > 0;
    const closed = values.length > 0;
    this.props.onChangeActions({
      waive: open,
      transfer: open,
      refund: open || closed,
      regularpayment: open,
    });
  }

  toggleAll(e) {
    const accounts = this.props.accounts;
    const checkedAccounts = (e.target.checked)
      ? accounts.reduce((memo, a) => (Object.assign(memo, { [a.id]: a })), {})
      : {};
    const values = Object.values(checkedAccounts);

    let selected = 0;
    values.forEach((v) => {
      selected += (v.remaining * 100);
    });
    selected /= 100;
    this.props.onChangeSelected(parseFloat(selected).toFixed(2), values);

    const open = selected > 0;
    const closed = values.length > 0;
    this.props.onChangeActions({
      waive: open,
      transfer: open,
      refund: open || closed,
      regularpayment: open,
    });

    this.setState(({ allChecked }) => ({
      allChecked: !allChecked
    }));
  }

  rowUpdater = (f) => {
    const accounts = this.props.selectedAccounts;
    return this.state.allChecked ||
    (accounts.findIndex(a => a.id === f.id) !== -1);
  };

  handleOptionsChange(itemMeta, e) {
    e.preventDefault();
    e.stopPropagation();

    const { a, action } = itemMeta;

    if (action && this[action]) {
      this[action](a);
    }
  }
  // ellipsis actions

  // eslint-disable-next-line class-methods-use-this
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

  refund(a, e) {
    if (e) {
      e.preventDefault();
    }

    this.props.onChangeActions({ refundModal: true }, [a]);
  }

  loanDetails(a, e) {
    const { history, match: { params } } = this.props;
    nav.onClickViewLoanActionsHistory(e, { id: a.loanId }, history, params);
  }

  renderActions(a) {
    const disabled = (a.status.name === 'Closed');
    const elipsis = {
      pay: disabled,
      waive: disabled,
      transfer: disabled,
      error: disabled || !isCancelAllowed(a),
      loan: (a.loanId === '0' || !a.loanId),
      refund: !isRefundAllowed(a),
    };

    const buttonDisabled = !this.props.stripes.hasPerm('ui-users.feesfines.actions.all');

    return (
      <Dropdown
        onSelectItem={this.handleOptionsChange}
      >
        <Button data-test-ellipsis-button data-role="toggle" buttonStyle="hover dropdownActive">
          <strong>•••</strong>
        </Button>
        <DropdownMenu id="ellipsis-drop-down" data-role="menu">
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
          <MenuItem itemMeta={{ a, action: 'refund' }}>
            <Button disabled={!((elipsis.refund === false) && (buttonDisabled === false))} buttonStyle="dropdownItem">
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
      </Dropdown>
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
      'title': intl.formatMessage({ id: 'ui-users.accounts.history.columns.instance' }),
      'barcode': intl.formatMessage({ id: 'ui-users.accounts.history.columns.barcode' }),
      'callNumber': intl.formatMessage({ id: 'ui-users.accounts.history.columns.number' }),
      'dueDate': intl.formatMessage({ id: 'ui-users.accounts.history.columns.due' }),
      'returnedDate': intl.formatMessage({ id: 'ui-users.accounts.history.columns.returned' }),
    };


    return (
      <MultiColumnList
        id="list-accounts-history-view-feesfines"
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
        sortOrder={sortOrder[0]}
        sortDirection={`${sortDirection[0]}ending`}
        onRowClick={this.onRowClick}
        rowUpdater={this.rowUpdater}
      />
    );
  }
}

export default ViewFeesFines;
