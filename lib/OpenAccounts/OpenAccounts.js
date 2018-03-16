import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';

import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import Button from '@folio/stripes-components/lib/Button';
import { UncontrolledDropdown } from '@folio/stripes-components/lib/Dropdown';
import MenuItem from '@folio/stripes-components/lib/MenuItem';
import DropdownMenu from '@folio/stripes-components/lib/DropdownMenu';
import Modal from '@folio/stripes-components/lib/Modal';
import Icon from '@folio/stripes-components/lib/Icon';
import Popover from '@folio/stripes-components/lib/Popover';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';

import { formatDate } from '../../util';
import Pay from '../Pay';

const sortMap = {
  item: f => f.item,
  charged: f => f.charged,
  remaining: f => f.remaining,
  barcode: f => f.barcode,
  'date created': f => f.dateCreated,
  'date updated': f => f.dateUpdated,
  'fee/fine type': f => f.feeFineType,
  'fee/fine owner': f => f.feeFineOwner,
  'call number': f => f.callnumber,
};

const TooltipStyle = {
  position: 'sticky',
  width: '150px',
  padding: '0 5px',
};

const TooltipInnerStyle = {
  padding: '3px 8px',
  color: '#fff',
  textAlign: 'center',
  borderRadius: 3,
  backgroundColor: '#000',
  opacity: 0.75,
};

const TooltipArrowStyle = {
  position: 'relative',
  width: 0,
  height: 0,
  borderRightColor: 'transparent',
  borderLeftColor: 'transparent',
  borderTopColor: 'transparent',
  borderBottomColor: 'transparent',
  borderStyle: 'solid',
  opacity: 0.75,
};

const PlacementStyles = {
  bottom: {
    tooltip: { marginBottom: 3, padding: '70px 0' },
    arrow: { top: 0, marginLeft: -5, borderWidth: '0 5px 5px', borderBottomColor: '#000' },
  },
};

const ToolTip = (props) => {
  const placementStyle = PlacementStyles[props.placement];

  const {
    style,
    arrowOffsetTop: top = placementStyle.arrow.top,
    children,
  } = props;

  return (
    <div style={{ ...TooltipStyle, ...placementStyle.tooltip, ...style }}>
      <div style={{ ...TooltipArrowStyle, ...placementStyle.arrow, top }} />
      <div style={TooltipInnerStyle}>
        {children}
      </div>
    </div>
  );
};

let account = {};

class OpenAccounts extends React.Component {
    static propTypes = {
      resources: PropTypes.shape({
        accounts: PropTypes.shape({
          records: PropTypes.arrayOf(PropTypes.object),
        }),
      }).isRequired,
      mutator: PropTypes.shape({
        accounts: PropTypes.shape({
          PUT: PropTypes.func.isRequired,
        }),
        activeRecord: PropTypes.shape({
          update: PropTypes.func.isRequired,
        }),
      }).isRequired,
      onChangeActions: PropTypes.func.isRequired,
      accounts: PropTypes.arrayOf(PropTypes.object),
    };

  static manifest = Object.freeze({
    accounts: {
      type: 'okapi',
      records: 'accounts',
      path: 'accounts',
      PUT: {
        path: 'accounts/%{activeRecord.id}',
      },
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
      viewPayMode: false,
      show: false,
    };

    this.onClickPayMode = this.onClickPayMode.bind(this);
    this.onClosePayMode = this.onClosePayMode.bind(this);
    this.onSort = this.onSort.bind(this);
    this.toggleAll = this.toggleAll.bind(this);
    this.handleOptionsChange = this.handleOptionsChange.bind(this);
    this.onPay = this.onPay.bind(this);
    this.comments = this.comments.bind(this);
    this.onRowClick = this.onRowClick.bind(this);
  }

  onRowClick(e, row) {
    console.log('onRowClick');
    if (e.target.type !== 'button') {
      this.props.onClickViewAccountActionsHistory(e, row);
    }
  }

  onClickPayMode(e) {
    if (e)e.preventDefault();
    this.setState({ viewPayMode: true });
  }

  onClosePayMode(e) {
    if (e)e.preventDefault();
    this.setState({ viewPayMode: false });
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


  onPay(data) {
    this.props.mutator.activeRecord.update({ id: account.id });
    account.remaining -= data.payment;
    this.props.mutator.accounts.PUT(account);
  }

  comments(f) {
    const t = f.feeFineType ? f.feeFineType : '';
    return (
      <div>
        <Row>
          <Col>{t}</Col>
          {f.comments ?
            <Col>
              <Popover inline>
                <Button data-role="target" buttonStyle="hover dropdownActive">
                  <img src="https://png.icons8.com/color/18/000000/note.png" />
                </Button>
                <p data-role="popover"><b>Comment</b> {f.comments} <a href="/users/123" className="active">Go to details</a></p>
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
      charged: f => (f.charged ? f.charged : ''),
      remaining: f => (f.remaining ? f.remaining : ''),
      'payment status': f => f.paymentStatus || '',
      'fee/fine owner': f => (f.feeFineOwner ? f.feeFineOwner : ''),
      item: f => `${f.item}(${f.itemType})`,
      barcode: f => (f.barcode ? f.barcode : ''),
      'call number': f => (f.callnumber ? f.callnumber : ''),
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
    this.setState({ ...this.state, checkedAccounts, allChecked });

    if (this.state.checkedAccounts != null) {
      this.props.onChangeActions({
        waive: true,
        transfer: true,
        refund: true,
        regularpayment: true,
      });
    }
  }

  toggleAll(e) {
    const accounts = this.props.accounts;
    const checkedAccounts = (e.target.checked)
      ? accounts.reduce((memo, a) => (Object.assign(memo, { [a.id]: a })), {})
      : {};

    const allChecked = !this.state.allChecked;
    this.setState({ ...this.state, checkedAccounts, allChecked });
  }

  handleOptionsChange(key, e) {
    e.preventDefault();
    e.stopPropagation();

    if (key.action && this[key.action]) {
      this[key.action](key.loan);
    }
  }

  pay(loan) {
    account = loan;
  }

  renderActions(loan) {
    return (
      <UncontrolledDropdown
        onSelectItem={this.handleOptionsChange}
      >
        <Button data-role="toggle" buttonStyle="hover dropdownActive"><strong>•••</strong></Button>
        <DropdownMenu data-role="menu" overrideStyle={{ padding: '6px 0' }}>
          <MenuItem>
            <Button buttonStyle="dropdownItem">Fee/fine details</Button>
          </MenuItem>
          <MenuItem itemMeta={{ loan, action: 'pay' }}>
            <Button buttonStyle="dropdownItem" onClick={this.onClickPayMode}>Pay</Button>
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
    };

    return (
      <div>
        <MultiColumnList
          id="list-accountshistory"
          formatter={this.getAccountsFormatter()}
          columnMapping={columnMapping}
          columnWidths={{ '  ': 28 }}
          visibleColumns={['  ', 'date created', 'date updated', 'fee/fine type', 'charged', 'remaining', 'payment status', 'fee/fine owner', 'item', 'barcode', 'call number', ' ']}
          fullWidth
          contentData={fees}
          onHeaderClick={this.onSort}
          sortOrder={sortOrder[0]}
          sortDirection={`${sortDirection[0]}ending`}
          onRowClick={this.onRowClick}
        />
        <Modal
          label="Pay"
          open={this.state.viewPayMode}
          onClose={this.onClosePayMode}
          size="small"
        >
          <Pay
            account={account}
            onSubmit={data => this.onPay(data)}
          />
        </Modal>
      </div>
    );
  }
}

export default OpenAccounts;

