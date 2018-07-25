import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';

import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import Button from '@folio/stripes-components/lib/Button';
import { UncontrolledDropdown } from '@folio/stripes-components/lib/Dropdown';
import MenuItem from '@folio/stripes-components/lib/MenuItem';
import DropdownMenu from '@folio/stripes-components/lib/DropdownMenu';
import Popover from '@folio/stripes-components/lib/Popover';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';

import { formatDate } from '../../../util';

class AllAccounts extends React.Component {
  static manifest = Object.freeze({
    comments: {
      type: 'okapi',
      records: 'feefineactions',
      path: 'feefineactions?query=userId=%{activeRecord.id}&limit=100',
    },
    activeRecord: {},
  });

  static propTypes = {
    stripes: PropTypes.shape({
      intl: PropTypes.object.isRequired,
    }),
    resources: PropTypes.shape({
      comments: PropTypes.object,
    }),
    user: PropTypes.object,
    mutator: PropTypes.shape({
      activeRecord: PropTypes.object,
    }),
    onChangeSelected: PropTypes.func.isRequired,
    onClickViewAccountActionsHistory: PropTypes.func.isRequired,
    accounts: PropTypes.arrayOf(PropTypes.object),
    onChangeActions: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.onSort = this.onSort.bind(this);
    this.toggleAll = this.toggleAll.bind(this);
    this.handleOptionsChange = this.handleOptionsChange.bind(this);
    this.comments = this.comments.bind(this);
    this.onRowClick = this.onRowClick.bind(this);

    const { stripes } = props;

    this.sortMap = {
      [stripes.intl.formatMessage({ id: 'ui-users.accounts.open.columns.title' })]: f => f.title,
      [stripes.intl.formatMessage({ id: 'ui-users.accounts.open.columns.amount' })]: f => f.amount,
      [stripes.intl.formatMessage({ id: 'ui-users.accounts.open.columns.remaining' })]: f => f.remaining,
      [stripes.intl.formatMessage({ id: 'ui-users.accounts.open.columns.barcode' })]: f => f.barcode,
      [stripes.intl.formatMessage({ id: 'ui-users.accounts.open.columns.created' })]: f => (f.metadata || {}).createdDate,
      [stripes.intl.formatMessage({ id: 'ui-users.accounts.open.columns.updated' })]: f => (f.metadata || {}).updatedDate,
      [stripes.intl.formatMessage({ id: 'ui-users.accounts.open.columns.type' })]: f => f.feeFineType,
      [stripes.intl.formatMessage({ id: 'ui-users.accounts.open.columns.owner' })]: f => f.feeFineOwner,
      [stripes.intl.formatMessage({ id: 'ui-users.accounts.open.columns.number' })]: f => f.callNumber,
      [stripes.intl.formatMessage({ id: 'ui-users.accounts.open.columns.status' })]: f => (f.paymentStatus || {}).name,
    };

    this.state = {
      checkedAccounts: {},
      allChecked: false,
      sortOrder: [
        stripes.intl.formatMessage({ id: 'ui-users.accounts.open.columns.title' }),
        stripes.intl.formatMessage({ id: 'ui-users.accounts.open.columns.amount' }),
        stripes.intl.formatMessage({ id: 'ui-users.accounts.open.columns.remaining' }),
        stripes.intl.formatMessage({ id: 'ui-users.accounts.open.columns.barcode' }),
        stripes.intl.formatMessage({ id: 'ui-users.accounts.open.columns.updated' }),
        stripes.intl.formatMessage({ id: 'ui-users.accounts.open.columns.type' }),
        stripes.intl.formatMessage({ id: 'ui-users.accounts.open.columns.owner' }),
        stripes.intl.formatMessage({ id: 'ui-users.accounts.open.columns.number' }),
        stripes.intl.formatMessage({ id: 'ui-users.accounts.open.columns.status' }),
      ],
      sortDirection: ['asc', 'asc'],
    };
  }

  componentDidMount() {
    const user = this.props.user || {};
    this.props.mutator.activeRecord.update({ id: user.id });
  }

  shouldComponentUpdate(nextProps, nextState) {
    const props = this.props;
    const comments = _.get(props.resources, ['comments', 'records'], []);
    const nextComments = _.get(nextProps.resources, ['comments', 'records'], []);
    return comments !== nextComments ||
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

    this.setState({ ...this.state, sortOrder, sortDirection });
  }

  comments(f) {
    const t = f.feeFineType ? f.feeFineType : '';
    const comments = _.get(this.props.resources, ['comments', 'records'], []);
    const actions = _.orderBy(comments.filter(c => c.accountId === f.id), ['dateAction'], ['asc']);
    const n = actions.length;
    const myComments = actions.map(a => a.comments);
    return (
      <div>
        <Row>
          <Col>{t}</Col>
          {(myComments[0] !== undefined) ?
            <Col style={{ marginLeft: '5px' }}>
              <Popover>
                <div data-role="target">
                  <img src="https://png.icons8.com/color/18/000000/note.png" alt="" />
                </div>
                <p data-role="popover"><b>Comment {n} of {n}</b> {myComments[n - 1]} <a href="/users/123" className="active">Go to details</a></p>
              </Popover>
            </Col>
        : ' '}
        </Row>
      </div>
    );
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
      'date created': f => (f.metadata ? formatDate(f.metadata.createdDate) : '00/00/0000'),
      'date updated': f => (f.metadata ? formatDate(f.metadata.updatedDate) : '00/00/0000'),
      'fee/fine type': f => (f.feeFineType ? this.comments(f) : '-'),
      'charged': f => (f.amount ? f.amount : '-'),
      'remaining': f => f.remaining || '0.00',
      'payment status': f => (f.paymentStatus || {}).name || '-',
      'fee/fine owner': f => (f.feeFineOwner ? f.feeFineOwner : '-'),
      'item': f => (f.title ? `${f.title}(${f.materialType})` : '-'),
      'barcode': f => (f.barcode ? f.barcode : '-'),
      'call number': f => (f.callNumber ? f.callNumber : '-'),
      ' ': f => this.renderActions(f),
    };
  }

  toggleItem(e, account) {
    e.stopPropagation();
    const id = account.id;
    const accounts = this.state.checkedAccounts;
    const checkedAccounts = (accounts[id])
      ? _.omit(account, id)
      : { ...accounts, [id]: account };
    const allChecked = _.size(checkedAccounts) === this.props.accounts.length;
    this.setState({ ...this.state, checkedAccounts, allChecked });

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

    const allChecked = !this.state.allChecked;
    this.setState({ ...this.state, checkedAccounts, allChecked });
  }

  handleOptionsChange(itemMeta, e) {
    e.preventDefault();
    e.stopPropagation();

    const { a, action } = itemMeta;

    if (action && this[action]) {
      this[action](a);
    }
  }

  renderActions() {
    return (
      <UncontrolledDropdown
        onSelectItem={this.handleOptionsChange}
      >
        <Button data-role="toggle" buttonStyle="hover dropdownActive"><strong>•••</strong></Button>
        <DropdownMenu data-role="menu" overrideStyle={{ padding: '6px 0' }}>
          <MenuItem>
            <Button buttonStyle="dropdownItem">Fee/fine details</Button>
          </MenuItem>
          <MenuItem>
            <Button buttonStyle="dropdownItem">Pay</Button>
          </MenuItem>
          <MenuItem>
            <Button buttonStyle="dropdownItem">Waive</Button>
          </MenuItem>
          <MenuItem>
            <Button buttonStyle="dropdownItem">Refund</Button>
          </MenuItem>
          <MenuItem>
            <Button buttonStyle="dropdownItem">Transfer</Button>
          </MenuItem>
          <MenuItem>
            <Button buttonStyle="dropdownItem">Error</Button>
          </MenuItem>
          <hr />
          <MenuItem>
            <Button buttonStyle="dropdownItem">Loan details</Button>
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
      'charged': 'Charged',
      'remaining': 'Remaining',
      'item': 'Item',
    };

    return (
      <div>
        <MultiColumnList
          id="list-accountshistory"
          formatter={this.getAccountsFormatter()}
          columnMapping={columnMapping}
          columnWidths={{ '  ': 28, 'date created': 110, 'date updated': 110 }}
          visibleColumns={['  ', 'date created', 'date updated', 'fee/fine type', 'charged', 'remaining', 'payment status', 'fee/fine owner', 'item', 'barcode', 'call number', ' ']}
          fullWidth
          contentData={fees}
          onHeaderClick={this.onSort}
          onRowClick={this.onRowClick}
          sortOrder={sortOrder[0]}
          sortDirection={`${sortDirection[0]}ending`}
        />
      </div>
    );
  }
}

export default AllAccounts;

