import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  FormattedDate,
  FormattedMessage,
  FormattedTime,
} from 'react-intl';

import {
  Button,
  Dropdown,
  DropdownMenu,
  MultiColumnList,
  Popover,
  Row,
  Col,
  Icon,
} from '@folio/stripes/components';

import { itemStatuses } from '../../../constants';
import {
  calculateSortParams,
  nav,
  isRefundAllowed,
} from '../../util';
import {
  isCancelAllowed,
} from '../accountFunctions';
import css from './ViewFeesFines.css';

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
    feeFineActions: PropTypes.arrayOf(PropTypes.object),
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

    if (row?.id && !e?.target?.type?.match(/checkbox|button/i) && e.target.tagName !== 'IMG') {
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

  showComments = (feeFine) => {
    const feeFineType = feeFine.feeFineType ? feeFine.feeFineType : '';
    const comments = _.get(this.props.resources, ['comments', 'records'], []);
    const actions = _.orderBy(comments.filter(c => c.accountId === feeFine.id), ['dateAction'], ['asc']);
    const myComments = actions.filter(a => a.comments).map(a => a.comments);
    const commentsAmount = myComments.length;

    return (
      <div>
        <Row>
          <Col>{feeFineType}</Col>
          {commentsAmount ?
            <Col className={css.iconColumn}>
              <Popover>
                <div data-role="target">
                  <Icon
                    icon="comment"
                    size="small"
                  />
                </div>
                <div data-role="popover">
                  <b>
                    <FormattedMessage
                      id="ui-users.accounts.history.staff.info"
                      values={{ count: commentsAmount }}
                    />
                  </b>
                  {` ${myComments[commentsAmount - 1]} `}
                  <Link to={`/users/${feeFine.userId}/accounts/view/${feeFine.id}`}>
                    <FormattedMessage id="ui-users.accounts.history.link.details" />
                  </Link>
                </div>
              </Popover>
            </Col>
            : null}
        </Row>
      </div>
    );
  }

  getAccountsFormatter() {
    const accounts = this.props.selectedAccounts;
    return {
      // Changed onChange to onClick to make sure the click event is correctly propagated
      // and the checkbox actually changes visually.
      // There seems to be a bug in MCL where when the onRowClick is registered
      // the even is being stopped from propagation:
      // https://github.com/folio-org/stripes-components/blob/08fa633f7660869bc1a29c0f13d80deba62afc80/lib/MultiColumnList/MCLRenderer.js#L834
      // which currently causes the checkbox to not be visually updated.
      '  ': f => (
        <input
          checked={(accounts.findIndex(a => a.id === f.id) !== -1)}
          onClick={e => this.toggleItem(e, f)}
          type="checkbox"
        />
      ),
      'metadata.createdDate': f => (f.metadata ? <FormattedDate value={f.metadata.createdDate} /> : '-'),
      'metadata.updatedDate': f => (f.metadata && f.metadata.createdDate !== f.metadata.updatedDate ? <FormattedDate value={f.metadata.updatedDate} /> : '-'),
      'feeFineType': f => (f.feeFineType ? this.showComments(f) : '-'),
      'amount': f => (f.amount ? parseFloat(f.amount).toFixed(2) : '-'),
      'remaining': f => parseFloat(f.remaining).toFixed(2) || '0.00',
      'paymentStatus.name': f => (f.paymentStatus || {}).name || '-',
      'feeFineOwner': f => (f.feeFineOwner ? f.feeFineOwner : '-'),
      'title': item => this.formatTitle(item),
      'barcode': f => (f.barcode ? f.barcode : '-'),
      'callNumber': f => (f.callNumber ? f.callNumber : '-'),
      'dueDate': f => (f.dueDate ? this.formatDateTime(f.dueDate) : '-'),
      'returnedDate': f => (this.getLoan(f).returnDate ? this.formatDateTime(this.getLoan(f).returnDate) : '-'),
      ' ': f => this.renderActions(f, this.getLoan(f)),
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
    this.updateToggle(checkedAccounts);
  }

  toggleAll(e) {
    const accounts = this.props.accounts;
    const checkedAccounts = (e.target.checked)
      ? accounts.reduce((memo, a) => (Object.assign(memo, { [a.id]: a })), {})
      : {};

    this.updateToggle(checkedAccounts);
    this.setState(({ allChecked }) => ({
      allChecked: !allChecked
    }));
  }

  updateToggle(checkedAccounts) {
    const values = Object.values(checkedAccounts);

    let selected = 0;
    let someIsClaimReturnedItem = false;
    values.forEach((v) => {
      selected += (v.remaining * 100);
      const loan = this.getLoan(v);
      someIsClaimReturnedItem = (someIsClaimReturnedItem || (loan.item && loan.item.status && loan.item.status.name && loan.item.status.name === itemStatuses.CLAIMED_RETURNED));
    });
    selected /= 100;
    this.props.onChangeSelected(parseFloat(selected).toFixed(2), values);

    const open = selected > 0;
    const closed = values.length > 0;
    this.props.onChangeActions({
      waive: open && !someIsClaimReturnedItem,
      transfer: open && !someIsClaimReturnedItem,
      refund: ((open && !someIsClaimReturnedItem) || closed),
      regularpayment: open && !someIsClaimReturnedItem,
    });
  }

  rowUpdater = (f) => {
    const accounts = this.props.selectedAccounts;
    return this.state.allChecked ||
    (accounts.findIndex(a => a.id === f.id) !== -1);
  };

  handleOptionsChange(itemMeta) {
    const { account, action } = itemMeta;

    if (action && this[action]) {
      this[action](account);
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

  /**
   * renderToggle
   * trigger for the ellipses menu
   */
  renderToggle = ({ triggerRef, onToggle, ariaProps, keyHandler }) => (
    <Button
      data-test-ellipsis-button
      ref={triggerRef}
      onClick={onToggle}
      onKeyDown={keyHandler}
      buttonStyle="hover dropdownActive"
      {...ariaProps}
    >
      <strong>•••</strong>
    </Button>
  );

  /**
   * MenuButton
   * inner-class for an element on the ellipses-menu
   */
  MenuButton = ({ disabled, account, action, children }) => {
    const onClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.handleOptionsChange({ account, action });
    };

    return (
      <Button disabled={disabled} buttonStyle="dropdownItem" onClick={onClick}>
        {children}
      </Button>
    );
  };

  /**
   * renderActions
   * return the ellipses menu, a <Dropdown>
   * @param a object: an account
   */
  renderActions(a, loan) {
    const { feeFineActions = [] } = this.props;

    // disable ellipses menu actions based on account-status
    const isClosed = (a.status.name === 'Closed');
    const isDisabled = {
      pay: isClosed,
      waive: isClosed,
      transfer: isClosed,
      error: isClosed || !isCancelAllowed(a),
      loan: (!loan.id || a.loanId === '0' || !a.loanId),
      refund: !isRefundAllowed(a, feeFineActions),
    };

    // disable ellipses menu actions based on permissions
    const buttonDisabled = !this.props.stripes.hasPerm('ui-users.feesfines.actions.all');
    const isClaimReturnedItem = (loan.item && loan.item.status && loan.item.status.name && loan.item.status.name === itemStatuses.CLAIMED_RETURNED);
    const loanText = isDisabled.loan ? 'ui-users.accounts.history.button.loanAnonymized' : 'ui-users.accounts.history.button.loanDetails';
    return (
      <Dropdown
        renderTrigger={this.renderToggle}
        usePortal
      >
        <DropdownMenu id="ellipsis-drop-down">
          <this.MenuButton disabled={isDisabled.pay || buttonDisabled || isClaimReturnedItem} account={a} action="pay">
            <FormattedMessage id="ui-users.accounts.history.button.pay" />
          </this.MenuButton>
          <this.MenuButton disabled={isDisabled.waive || buttonDisabled || isClaimReturnedItem} account={a} action="waive">
            <FormattedMessage id="ui-users.accounts.history.button.waive" />
          </this.MenuButton>
          <this.MenuButton disabled={isDisabled.refund || buttonDisabled || isClaimReturnedItem} account={a} action="refund">
            <FormattedMessage id="ui-users.accounts.history.button.refund" />
          </this.MenuButton>
          <this.MenuButton disabled={isDisabled.transfer || buttonDisabled || isClaimReturnedItem} account={a} action="transfer">
            <FormattedMessage id="ui-users.accounts.history.button.transfer" />
          </this.MenuButton>
          <this.MenuButton disabled={isDisabled.error || buttonDisabled || isClaimReturnedItem} account={a} action="cancel">
            <FormattedMessage id="ui-users.accounts.button.error" />
          </this.MenuButton>
          <hr />
          <this.MenuButton disabled={isDisabled.loan || buttonDisabled} account={a} action="loanDetails">
            <FormattedMessage id={loanText} />
          </this.MenuButton>
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
      'title': intl.formatMessage({ id: 'ui-users.accounts.history.columns.title' }),
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
