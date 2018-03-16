import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import Button from '@folio/stripes-components/lib/Button';
import { UncontrolledDropdown } from '@folio/stripes-components/lib/Dropdown';
import MenuItem from '@folio/stripes-components/lib/MenuItem';
import DropdownMenu from '@folio/stripes-components/lib/DropdownMenu';
import FilterPaneSearch from '@folio/stripes-components/lib/FilterPaneSearch';
import Icon from '@folio/stripes-components/lib/Icon';
import Popover from '@folio/stripes-components/lib/Popover';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Pay from '../Pay';
import { formatDate } from '../../util';
import { Link } from 'react-router-dom';

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

class AllAccounts extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      locale: PropTypes.string.isRequired,
    }).isRequired,
  };

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

    this.connectedPay = props.stripes.connect(Pay);
    this.onClickPayMode = this.onClickPayMode.bind(this);
    this.onClosePayMode = this.onClosePayMode.bind(this);
    this.onSort = this.onSort.bind(this);
    this.toggleAll = this.toggleAll.bind(this);
    this.handleOptionsChange = this.handleOptionsChange.bind(this);
    this.comments = this.comments.bind(this);

    const logger = props.stripes.logger;
    this.log = logger.log.bind(logger);
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


  comments(f) {
    const t = f.feeFineType ? f.feeFineType : '';
    return (
      <div>
        <Row>
          <Col>{t}</Col>
            {f.comments  ?
              <Col>
                <Popover inline>
                  <Button data-role="target" buttonStyle="hover dropdownActive">
                    <img src="https://png.icons8.com/color/18/000000/note.png"/>
                  </Button>
                  <p data-role="popover">{f.comments}<a href="/users/123" className="active">Go to details</a></p>
                </Popover>
              </Col>
            : ''}
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
      'fee/fine owner': f => (f.feeFineOwner ? f.feeFineOwner : ''),
      item: f => `${f.item}(${f.itemType})`,
      barcode: f => (f.barcode ? f.barcode : ''),
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
      ? accounts.reduce((memo, account) => (Object.assign(memo, { [account.id]: account })), {})
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
          <MenuItem>
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
    // const uiu219View = _.get(props.resources, ['feefines','records'],[]);
    const fees = _.orderBy(props.accounts, [sortMap[sortOrder[0]], sortMap[sortOrder[1]]], sortDirection);

    const searchHeader = <FilterPaneSearch id="SearchField" onChange={this.onChangeSearch} onClear={this.onClearSearch} resultsList={this.resultsList} value={this.state.searchTerm} />;
    const columnMapping = {
      '  ': (<input type="checkbox" checked={this.state.allChecked} name="check-all" onChange={this.toggleAll} />),
    };

    return (
      <div>
        <MultiColumnList
          id="list-accountshistory"
          formatter={this.getAccountsFormatter()}
          columnMapping={columnMapping}
          columnWidths={{ '  ': 28 }}
          visibleColumns={['  ', 'date created', 'date updated', 'fee/fine type', 'charged', 'remaining', 'fee/fine owner', 'item', 'barcode', 'call number', ' ']}
          fullWidth
          contentData={fees}
          onHeaderClick={this.onSort}
          sortOrder={sortOrder[0]}
          sortDirection={`${sortDirection[0]}ending`}
        />
      </div>
    );
  }
}

export default AllAccounts;

