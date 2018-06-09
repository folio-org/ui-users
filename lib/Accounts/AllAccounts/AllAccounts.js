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

import { formatDate } from '../util';

const sortMap = {
  'Instance(Item Type)': f => f.item,
  'Charged Amount': f => f.charged,
  'Remaining Amount': f => f.remaining,
  'barcode': f => f.barcode,
  'date created': f => f.dateCreated,
  'date updated': f => f.dateUpdated,
  'fee/fine type': f => f.feeFineType,
  'fee/fine owner': f => f.feeFineOwner,
  'call number': f => f.callnumber,
  'payment status': f => f.paymentStatus,
};


class AllAccounts extends React.Component {
  static propTypes = {
    resources: PropTypes.shape({
      comments: PropTypes.object,
    }),
    onChangeSelected: PropTypes.func.isRequired,
    onClickViewAccountActionsHistory: PropTypes.func.isRequired,
    accounts: PropTypes.arrayOf(PropTypes.object),
    onChangeActions: PropTypes.func.isRequired,
  };
  static manifest = Object.freeze({
    comments: {
      type: 'okapi',
      records: 'feefineactions',
      path: 'feefineactions?query=userId=:{id}&limit=100',
    },
    activeRecord: {},
  });

  constructor(props) {
    super(props);
    this.state = {
      checkedAccounts: {},
      allChecked: false,
      sortOrder: ['date created', 'date created'],
      sortDirection: ['asc', 'asc'],
    };

    this.onSort = this.onSort.bind(this);
    this.toggleAll = this.toggleAll.bind(this);
    this.handleOptionsChange = this.handleOptionsChange.bind(this);
    this.comments = this.comments.bind(this);
    this.onRowClick = this.onRowClick.bind(this);
  }

  onRowClick(e, row) {
    if ((e.target.type !== 'button') && (e.target.tagName !== 'IMG')) {
      this.props.onClickViewAccountActionsHistory(e, row);
    }
  }

  onSort(e, meta) {
    if (!sortMap[meta.alias]) return;

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
                <p data-role="popover"><b>Comment {n} of {n}</b> {myComments[0]} <a href="/users/123" className="active">Go to details</a></p>
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
      'date created': f => (f.dateCreated ? formatDate(f.dateCreated) : '00/00/0000'),
      'date updated': f => (f.dateUpdated ? formatDate(f.dateUpdated) : '00/00/0000'),
      'fee/fine type': f => (f.feeFineType ? this.comments(f) : ''),
      'charged': f => (f.charged ? f.charged : ''),
      'remaining': f => f.remaining || '0.00',
      'payment status': f => f.paymentStatus || '',
      'fee/fine owner': f => (f.feeFineOwner ? f.feeFineOwner : ''),
      'item': f => (f.item ? `${f.item}(${f.itemType})` : '-'),
      'barcode': f => (f.barcode ? f.barcode : ''),
      'call number': f => (f.callnumber ? f.callnumber : ''),
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

    this.props.onChangeSelected(selected);

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

    this.props.onChangeSelected(selected);

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
    const fees = _.orderBy(props.accounts, [sortMap[sortOrder[0]], sortMap[sortOrder[1]]], sortDirection);
    const columnMapping = {
      '  ': (<input type="checkbox" checked={allChecked} name="check-all" onChange={this.toggleAll} />),
      'charged': 'Charged Amount',
      'remaining': 'Remaining Amount',
      'item': 'Instance(Item Type)',
    };

    return (
      <div>
        <MultiColumnList
          id="list-accountshistory"
          formatter={this.getAccountsFormatter()}
          columnMapping={columnMapping}
          columnWidths={{ '  ': 28, 'date created': 100, 'date updated': 100 }}
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

