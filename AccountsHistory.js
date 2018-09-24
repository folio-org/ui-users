import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import queryString from 'query-string';
import Button from '@folio/stripes-components/lib/Button';
import Icon from '@folio/stripes-components/lib/Icon';
import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import SegmentedControl from '@folio/stripes-components/lib/SegmentedControl';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import IconButton from '@folio/stripes-components/lib/IconButton';
import makeQueryFunction from '@folio/stripes-components/util/makeQueryFunction';
import { filterState } from '@folio/stripes-components/lib/FilterGroups';
import { Dropdown } from '@folio/stripes-components/lib/Dropdown';
import Checkbox from '@folio/stripes-components/lib/Checkbox';
import DropdownMenu from '@folio/stripes-components/lib/DropdownMenu';

import { getFullName } from './util';
import { Actions } from './lib/Accounts/Actions';
import { count, handleFilterChange, handleFilterClear } from './lib/Accounts/accountFunctions';

import {
  Menu,
  Filters,
  OpenAccounts,
  AllAccounts,
  ClosedAccounts,
} from './lib/Accounts';

const filterConfig = [
  {
    label: 'Fee/Fine Owner',
    name: 'owner',
    cql: 'feeFineOwner',
    values: [],
  }, {
    label: 'Payment Status',
    name: 'status',
    cql: 'paymentStatus.name',
    values: [],
  }, {
    label: 'Fee/Fine Type',
    name: 'type',
    cql: 'feeFineType',
    values: [],
  }, {
    label: 'Item Type',
    name: 'material',
    cql: 'materialType',
    values: [],
  },
];

const queryFunction = (findAll, queryTemplate, sortMap, fConfig, failOnCondition, nsParams) => {
  const getCql = makeQueryFunction(findAll, queryTemplate, sortMap, fConfig, failOnCondition, nsParams);
  return (queryParams, pathComponents, resourceValues, logger) => {
    let cql = getCql(queryParams, pathComponents, resourceValues, logger);
    const { user } = resourceValues;
    if (cql === undefined) { cql = `userId=${user.id}`; } else { cql = `(${cql}) and (userId=${user.id})`; }
    return cql;
  };
};

class AccountsHistory extends React.Component {
  static manifest = Object.freeze({
    initializedFilterConfig: { initialValue: false },
    query: { initialValue: {} },
    filter: {
      type: 'okapi',
      records: 'accounts',
      path: 'accounts?query=userId=%{user.id}&limit=100',
    },
    feefineshistory: {
      type: 'okapi',
      records: 'accounts',
      path: 'accounts',
      recordsRequired: '%{activeRecord.records}',
      perRequest: 50,
      GET: {
        params: {
          query: queryFunction(
            'feeFineType=*',
            'feeFineType="%{query.query}*" or barcode="%{query.query}*" or materialType="%{query.query}" or title="%{query.query}*    " or feeFineOwner="%{query.query}*" or paymentStatus.name="%{query.query}"',
            { userId: 'userId' },
            filterConfig,
            0,
            { query: 'q', filters: 'f' },
          ),
        },
        staticFallback: { params: {} },
      },
    },
    activeRecord: {},
    user: {},
  });

  static propTypes = {
    stripes: PropTypes.shape({
      intl: PropTypes.object.isRequired,
      connect: PropTypes.func.isRequired,
    }),
    resources: PropTypes.shape({
      feefineshistory: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    okapi: PropTypes.object,
    user: PropTypes.object,
    onCancel: PropTypes.func.isRequired,
    onClickViewChargeFeeFine: PropTypes.func.isRequired,
    openAccounts: PropTypes.bool,
    patronGroup: PropTypes.object,
    mutator: PropTypes.shape({
      user: PropTypes.shape({
        update: PropTypes.func.isRequired,
      }),
      activeRecord: PropTypes.object,
    }),
    parentMutator: PropTypes.shape({
      query: PropTypes.object.isRequired,
    }),
    history: PropTypes.object,
    location: PropTypes.object,
    addRecord: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.controllableColumns = ['date created', 'date updated', 'fee/fine type', 'billed', 'remaining', 'payment status', 'fee/fine owner', 'instance (item type)', 'barcode', 'call number', 'due date', 'returned date'];

    const visibleColumns = this.controllableColumns.map(columnName => ({
      title: columnName,
      status: true,
    }));

    this.state = {
      visibleColumns,
      toggleDropdownState: false,
      showFilters: false,
      selectedAccounts: [],
      selected: 0,
      actions: {
        cancellation: false,
        pay: false,
        regular: false,
        regularpayment: false,
        waive: false,
        waiveModal: false,
        waiveMany: false,
        refund: false,
        transfer: false,
      },
    };

    this.handleActivate = this.handleActivate.bind(this);
    this.handleOptionsChange = this.handleOptionsChange.bind(this);
    this.onChangeActions = this.onChangeActions.bind(this);
    this.onChangeSelected = this.onChangeSelected.bind(this);
    this.connectedOpenAccounts = props.stripes.connect(OpenAccounts);
    this.connectedClosedAccounts = props.stripes.connect(ClosedAccounts);
    this.connectedAllAccounts = props.stripes.connect(AllAccounts);
    this.connectedActions = props.stripes.connect(Actions);

    this.handleRecords = this.handleRecords.bind(this);
    this.accounts = [];
    this.addRecord = 50;
    this.editRecord = 0;

    this.transitionToParams = values => this.props.parentMutator.query.update(values);
    this.handleFilterChange = handleFilterChange.bind(this);
    this.handleFilterClear = handleFilterClear.bind(this);
    this.filterState = filterState.bind(this);
    this.possibleColumns = ['  ', 'date created', 'date updated', 'fee/fine type', 'billed', 'remaining', 'payment status', 'fee/fine owner', 'instance (item type)', 'barcode', 'call number', 'due date', 'returned date', ' '];
    this.getVisibleColumns = this.getVisibleColumns.bind(this);
    this.renderCheckboxList = this.renderCheckboxList.bind(this);
    this.toggleColumn = this.toggleColumn.bind(this);
    this.onDropdownClick = this.onDropdownClick.bind(this);

    const initialQuery = queryString.parse(props.location.search) || {};
    this.initialFilters = initialQuery.f;
  }

  componentDidMount() {
    this.props.mutator.activeRecord.update({ records: 30 });
    this.props.mutator.user.update({ id: this.props.user.id });
  }


  shouldComponentUpdate(nextProps, nextState) {
    const filter = _.get(this.props.resources, ['filter', 'records'], []);
    const nextFilter = _.get(nextProps.resources, ['filter', 'records'], []);
    const accounts = _.get(this.props.resources, ['feefineshistory', 'records'], []);
    const nextAccounts = _.get(nextProps.resources, ['feefineshistory', 'records'], []);
    if (this.addRecord !== nextProps.num) {
      this.props.mutator.activeRecord.update({ records: nextProps.num });
      this.addRecord = nextProps.num;
    }
    return this.state !== nextState ||
      filter !== nextFilter ||
      accounts !== nextAccounts;
  }

  componentDidUpdate(prevProps) {
    let filterAccounts = _.get(this.props.resources, ['filter', 'records'], []);
    const query = this.props.location.search ? queryString.parse(this.props.location.search) : {};
    if (query.layer === 'open-accounts') {
      filterAccounts = filterAccounts.filter(a => a.status.name === 'Open') || [];// a.status.name
    } else if (query.layer === 'closed-accounts') {
      filterAccounts = filterAccounts.filter(a => a.status.name === 'Closed') || [];// a.status.name
    }
    const feeFineTypes = count(filterAccounts.map(a => (a.feeFineType)));
    const feeFineOwners = count(filterAccounts.map(a => (a.feeFineOwner)));
    const paymentStatus = count(filterAccounts.map(a => (a.paymentStatus.name)));
    const itemTypes = count(filterAccounts.map(a => (a.materialType)));
    filterConfig[0].values = feeFineOwners.map(o => ({ name: `${o.name}`, cql: o.name }));
    filterConfig[1].values = paymentStatus.map(s => ({ name: `${s.name}`, cql: s.name }));
    filterConfig[2].values = feeFineTypes.map(f => ({ name: `${f.name}`, cql: f.name }));
    filterConfig[3].values = itemTypes.map(i => ({ name: `${i.name}`, cql: i.name }));

    if (this.editRecord !== 0) {
      if (this.editRecord === 1) prevProps.mutator.activeRecord.update({ records: 51 });
      else prevProps.mutator.activeRecord.update({ records: 50 });
      this.editRecord = 0;
    }
  }

  queryParam = name => {
    const query = queryString.parse(this.props.location.search) || {};
    return _.get(query, name);
  }

  onChangeActions(actions, a) {
    const newActions = { ...this.state.actions, ...actions };
    this.setState({
      actions: newActions,
    });
    if (a) {
      this.accounts = a;
    }
  }

  handleActivate({ id }) {
    this.props.parentMutator.query.update({ layer: id });
    this.setState({
      selected: 0,
      selectedAccounts: [],
      actions: {
        regularpayment: false,
        waive: false,
        refund: false,
        transfer: false,
      },
    });
  }

  handleEdit = (val) => {
    this.editRecord = val;
  }

  handleOptionsChange(itemMeta, e) {
    e.preventDefault();
    e.stopPropagation();

    if (itemMeta.action && this[itemMeta.action]) {
      this[itemMeta.action]();
    }
  }

  payment() {
    this.onChangeActions({ regular: true }, this.accounts);
  }

  handleRecords() {
    this.addRecord = true;
  }

  onChangeSearch = (e) => {
    const query = e.target.value;
    this.transitionToParams({ q: query });
  }

  onClearSearch = () => {
    this.transitionToParams({ q: '' });
  }

  onClearSearchAndFilters = () => {
    this.transitionToParams({ f: this.initialFilters || '', query: '', qindex: '' });
  }

  onChangeSelected(value, accounts = []) {
    this.setState({
      selected: value,
      selectedAccounts: accounts,
    });
    this.accounts = accounts;
  }

  toggleFilterPane = () => {
    this.setState(prevState => ({ showFilters: !prevState.showFilters }));
  }

  renderCheckboxList(columnMapping) {
    const { visibleColumns } = this.state;
    return visibleColumns.filter((o) =>
      Object.keys(columnMapping).includes(o.title))
      .map((column, i) => {
        const name = columnMapping[column.title];
        return (
          <li key={`columnitem-${i}`}>
            <Checkbox
              label={name}
              name={name}
              id={name}
              onChange={() => this.toggleColumn(column.title)}
              checked={column.status}
            />
          </li>
        );
      });
  }

  getVisibleColumns() {
    const { visibleColumns } = this.state;
    const visibleColumnsMap = visibleColumns.reduce((map, e) => {
      map[e.title] = e.status;
      return map;
    }, {});

    const columnsToDisplay = this.possibleColumns.filter((e) =>
      visibleColumnsMap[e] === undefined || visibleColumnsMap[e] === true);
    return columnsToDisplay;
  }

  onDropdownClick() {
    const state = this.state.toggleDropdownState !== true;
    this.setState({ toggleDropdownState: state });
  }

  toggleColumn(title) {
    const columnList = this.state.visibleColumns.map(column => {
      if (column.title === title) {
        const status = column.status;
        column.status = status !== true;
      }
      return column;
    });
    this.setState({ visibleColumns: columnList });
  }

  render() {
    const { user, patronGroup, resources, stripes } = this.props;
    const query = this.props.location.search ? queryString.parse(this.props.location.search) : {};

    let accounts = _.get(resources, ['feefineshistory', 'records'], []);
    if (query.loan) {
      accounts = accounts.filter(a => a.loanId === query.loan);
    }
    const open = accounts.filter(a => a.status.name === 'Open') || [];// a.status.name
    const closed = accounts.filter(a => a.status.name === 'Closed') || [];// a.status.name
    let badgeCount = accounts.length;
    if (query.layer === 'open-accounts') badgeCount = open.length;
    else if (query.layer === 'closed-accounts') badgeCount = closed.length;
    const filters = filterState(this.queryParam('f'));

    const closeMenu = (
      <PaneMenu>
        <button onClick={this.props.onCancel}>
          <Row>
            <Col><Icon icon="left-double-chevron" size="large" /></Col>
            <Col><span style={{ fontSize: 'x-large' }}>Back</span></Col>
          </Row>
        </button>
      </PaneMenu>
    );

    const columnMapping = {
      'date created': stripes.intl.formatMessage({ id: 'ui-users.accounts.history.columns.created' }),
      'date updated': stripes.intl.formatMessage({ id: 'ui-users.accounts.history.columns.updated' }),
      'fee/fine type': stripes.intl.formatMessage({ id: 'ui-users.accounts.history.columns.type' }),
      'billed': stripes.intl.formatMessage({ id: 'ui-users.accounts.history.columns.amount' }),
      'remaining': stripes.intl.formatMessage({ id: 'ui-users.accounts.history.columns.remaining' }),
      'payment status': stripes.intl.formatMessage({ id: 'ui-users.accounts.history.columns.status' }),
      'fee/fine owner': stripes.intl.formatMessage({ id: 'ui-users.accounts.history.columns.owner' }),
      'instance (item type)': stripes.intl.formatMessage({ id: 'ui-users.accounts.history.columns.title' }),
      'barcode': stripes.intl.formatMessage({ id: 'ui-users.accounts.history.columns.barcode' }),
      'call number': stripes.intl.formatMessage({ id: 'ui-users.accounts.history.columns.number' }),
      'due date': stripes.intl.formatMessage({ id: 'ui-users.accounts.history.columns.due' }),
      'returned date': stripes.intl.formatMessage({ id: 'ui-users.accounts.history.columns.returned' }),
    };

    const firstMenu = (
      <PaneMenu>
        <IconButton
          icon="search"
          onClick={this.toggleFilterPane}
          badgeCount={(user.id === (accounts[0] || {}).userId && accounts.length) ? badgeCount : undefined}
        />
        <Dropdown
          open={this.state.toggleDropdownState}
          onToggle={this.onDropdownClick}
        >
          <Button data-role="toggle">Select columns</Button>
          <DropdownMenu data-role="menu">
            <ul>
              {this.renderCheckboxList(columnMapping)}
            </ul>
          </DropdownMenu>
        </Dropdown>
      </PaneMenu>
    );

    const header = (
      <Row style={{ width: '100%' }}>
        <Col xs={1}>
          {firstMenu}
        </Col>
        <Col xsOffset={3} xs={5}>
          <SegmentedControl activeId={query.layer} onActivate={this.handleActivate}>
            <Button id="open-accounts"><FormattedMessage id="ui-users.accounts.open" /></Button>
            <Button id="closed-accounts"><FormattedMessage id="ui-users.accounts.closed" /></Button>
            <Button id="all-accounts"><FormattedMessage id="ui-users.accounts.all" /></Button>
          </SegmentedControl>
        </Col>
      </Row>
    );

    const selected = this.state.selected || 0;

    let balance = 0;
    accounts.forEach((a) => {
      balance += a.remaining;
    });

    const header1 = (
      <Row style={{ width: '80%' }}>
        <Col xs={7}> {closeMenu} </Col>
        <Col xs={4}>
          <Row>
            <Col>
              <b>{`Fees/Fines - ${getFullName(user)} (${_.upperFirst(patronGroup.group)})`}</b>
            </Col>
          </Row>
          <Row>
            <Col>
              Outstanding Balance:
              {' '}
              {(balance > 0 || balance === '') ? parseFloat(balance).toFixed(2) : '0.00'}
            </Col>
          </Row>
        </Col>
      </Row>
    );

    const visibleColumns = this.getVisibleColumns();

    return (
      <Paneset>
        <Pane
          defaultWidth="100%"
          header={header1}
        >
          <Paneset>
            <Filters
              query={query}
              parentMutator={this.props.parentMutator}
              toggle={this.toggleFilterPane}
              showFilters={this.state.showFilters}
              onChangeSearch={this.onChangeSearch}
              onClearFilters={this.handleFilterClear}
              onClearSearch={this.onClearSearch}
              filterConfig={filterConfig}
              filters={filters}
              onChangeFilter={(e) => { this.handleFilterChange(e, 'f'); }}
            />
            <Pane defaultWidth="fill" header={header}>
              <Menu
                user={user}
                showFilters={this.state.showFilters}
                filters={filters}
                balance={balance}
                selected={selected}
                actions={this.state.actions}
                query={query}
                onChangeActions={this.onChangeActions}
                patronGroup={patronGroup}
                handleOptionsChange={this.handleOptionsChange}
                onClickViewChargeFeeFine={this.props.onClickViewChargeFeeFine}
              />

              <Row>
                {(query.layer === 'open-accounts') ?
                  (<this.connectedOpenAccounts
                    {...this.props}
                    accounts={(user.id === (accounts[0] || {}).userId) ? open : []}
                    visibleColumns={visibleColumns}
                    onChangeSelected={this.onChangeSelected}
                    onChangeActions={this.onChangeActions}
                  />) : ''
                }
                {(query.layer === 'closed-accounts') ?
                  (<this.connectedClosedAccounts
                    {...this.props}
                    accounts={(user.id === (accounts[0] || {}).userId) ? closed : []}
                    visibleColumns={visibleColumns}
                    onChangeSelected={this.onChangeSelected}
                    onChangeActions={this.onChangeActions}
                  />) : ''
                }
                {(query.layer === 'all-accounts') ?
                  (<this.connectedAllAccounts
                    {...this.props}
                    accounts={(user.id === (accounts[0] || {}).userId) ? accounts : []}
                    visibleColumns={visibleColumns}
                    onChangeSelected={this.onChangeSelected}
                    onChangeActions={this.onChangeActions}
                  />) : ''
                }
              </Row>
              <this.connectedActions
                actions={this.state.actions}
                onChangeActions={this.onChangeActions}
                user={user}
                stripes={stripes}
                accounts={this.accounts}
                selectedAccounts={this.state.selectedAccounts}
                balance={balance}
                handleEdit={this.handleEdit}
              />
            </Pane>
          </Paneset>
        </Pane>
      </Paneset>
    );
  }
}

export default AccountsHistory;
