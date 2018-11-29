import _ from 'lodash';
import React from 'react';
import {
  FormattedMessage,
  intlShape,
  injectIntl,
} from 'react-intl';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import {
  Paneset,
  Pane,
  PaneMenu,
  IconButton,
  Icon,
  Button,
  Dropdown,
  DropdownMenu,
  Row,
  Col,
  Checkbox,
  SegmentedControl,
  filterState,
} from '@folio/stripes/components';
import { makeQueryFunction } from '@folio/stripes/smart-components';

import { getFullName } from './util';
import { Actions } from './components/Accounts/Actions';
import { count, handleFilterChange, handleFilterClear } from './components/Accounts/accountFunctions';


import {
  Menu,
  Filters,
  OpenAccounts,
  AllAccounts,
  ClosedAccounts,
} from './components/Accounts';

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

const args = [
  { name: 'user', value: 'x' },
];

const queryFunction = (findAll, queryTemplate, sortMap, fConfig, failOnCondition, nsParams, a) => {
  const getCql = makeQueryFunction(findAll, queryTemplate, sortMap, fConfig, failOnCondition, nsParams);
  return (queryParams, pathComponents, resourceValues, logger) => {
    let cql = getCql(queryParams, pathComponents, resourceValues, logger);
    const userId = a[0].value;
    if (cql === undefined) { cql = `userId=${userId}`; } else { cql = `(${cql}) and (userId=${userId})`; }
    return cql;
  };
};

class AccountsHistory extends React.Component {
  static manifest = Object.freeze({
    initializedFilterConfig: { initialValue: false },
    query: { initialValue: {} },
    comments: {
      type: 'okapi',
      records: 'feefineactions',
      path: 'feefineactions?query=(userId=%{activeRecord.userId} and comments=*)&limit=%{activeRecord.comments}',
    },
    filter: {
      type: 'okapi',
      records: 'accounts',
      recordsRequired: '%{activeRecord.records}',
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
            args,
          ),
        },
        staticFallback: { params: {} },
      },
    },
    activeRecord: { records: 50 },
    user: {},
  });

  static propTypes = {
    stripes: PropTypes.shape({
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
    intl: intlShape.isRequired,
  };

  constructor(props) {
    super(props);

    this.controllableColumns = [
      'created',
      'updated',
      'type',
      'amount',
      'remaining',
      'status',
      'owner',
      'title',
      'barcode',
      'number',
      'due',
      'returned',
    ];

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

    this.accounts = [];
    this.addRecord = 50;
    this.editRecord = 0;

    this.transitionToParams = values => this.props.parentMutator.query.update(values);
    this.handleFilterChange = handleFilterChange.bind(this);
    this.handleFilterClear = handleFilterClear.bind(this);
    this.filterState = filterState.bind(this);
    this.possibleColumns = [
      '  ',
      'created',
      'updated',
      'type',
      'amount',
      'remaining',
      'status',
      'owner',
      'title',
      'barcode',
      'number',
      'due',
      'returned',
      ' '
    ];
    this.getVisibleColumns = this.getVisibleColumns.bind(this);
    this.renderCheckboxList = this.renderCheckboxList.bind(this);
    this.toggleColumn = this.toggleColumn.bind(this);
    this.onDropdownClick = this.onDropdownClick.bind(this);

    const initialQuery = queryString.parse(props.location.search) || {};
    this.initialFilters = initialQuery.f;
  }

  componentDidMount() {
    this.props.mutator.activeRecord.update({ records: 50, comments: 200, userId: this.props.user.id });
    args[0].value = this.props.user.id;
  }

  shouldComponentUpdate(nextProps, nextState) {
    const filter = _.get(this.props.resources, ['filter', 'records'], []);
    const nextFilter = _.get(nextProps.resources, ['filter', 'records'], []);
    const accounts = _.get(this.props.resources, ['feefineshistory', 'records'], []);
    const nextAccounts = _.get(nextProps.resources, ['feefineshistory', 'records'], []);
    const comments = _.get(this.props.resources, ['comments', 'records'], []);
    const nextComments = _.get(nextProps.resources, ['comments', 'records'], []);
    if (JSON.stringify(accounts) !== JSON.stringify(nextAccounts)) {
      let selected = 0;
      this.state.selectedAccounts.forEach(a => {
        selected += nextAccounts.find(ac => ac.id === a.id).remaining;
      });
      this.setState({ selected });
    }

    if (this.addRecord !== nextProps.num) {
      this.props.mutator.activeRecord.update({ records: nextProps.num, comments: nextProps.num + 150 });
      this.addRecord = nextProps.num;
    }

    return this.state !== nextState ||
      filter !== nextFilter ||
      accounts !== nextAccounts ||
      comments !== nextComments ||
      this.props.resources.query !== nextProps.resources.query;
  }

  componentDidUpdate() {
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
  }

  queryParam = name => {
    const query = queryString.parse(this.props.location.search) || {};
    return _.get(query, name);
  }

  onChangeActions(newActions, a) {
    this.setState(({ actions }) => ({
      actions: { ...actions, ...newActions }
    }));

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
    this.props.handleAddRecords();
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
    return visibleColumns.filter((o) => Object.keys(columnMapping).includes(o.title))
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

    const columnsToDisplay = this.possibleColumns.filter((e) => visibleColumnsMap[e] === undefined || visibleColumnsMap[e] === true);
    return columnsToDisplay;
  }

  onDropdownClick() {
    this.setState(({ toggleDropdownState }) => ({
      toggleDropdownState: !toggleDropdownState
    }));
  }

  toggleColumn(title) {
    this.setState(({ visibleColumns }) => ({
      visibleColumns: visibleColumns.map(column => {
        if (column.title === title) {
          const status = column.status;
          column.status = status !== true;
        }
        return column;
      })
    }));
  }

  render() {
    const {
      user,
      patronGroup,
      resources,
      intl,
    } = this.props;
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
    const selectedAccounts = this.state.selectedAccounts.map(a => accounts.find(ac => ac.id === a.id) || {});

    const closeMenu = (
      <PaneMenu>
        <button onClick={this.props.onCancel} type="button">
          <Row>
            <Col><Icon icon="chevron-double-left" size="large" /></Col>
            <Col><span style={{ fontSize: 'x-large' }}>Back</span></Col>
          </Row>
        </button>
      </PaneMenu>
    );

    const columnMapping = {
      created: intl.formatMessage({ id: 'ui-users.accounts.history.columns.created' }),
      updated: intl.formatMessage({ id: 'ui-users.accounts.history.columns.updated' }),
      type: intl.formatMessage({ id: 'ui-users.accounts.history.columns.type' }),
      amount: intl.formatMessage({ id: 'ui-users.accounts.history.columns.amount' }),
      remaining: intl.formatMessage({ id: 'ui-users.accounts.history.columns.remaining' }),
      status: intl.formatMessage({ id: 'ui-users.accounts.history.columns.status' }),
      owner: intl.formatMessage({ id: 'ui-users.accounts.history.columns.owner' }),
      title: intl.formatMessage({ id: 'ui-users.accounts.history.columns.title' }),
      barcode: intl.formatMessage({ id: 'ui-users.accounts.history.columns.barcode' }),
      number: intl.formatMessage({ id: 'ui-users.accounts.history.columns.number' }),
      due: intl.formatMessage({ id: 'ui-users.accounts.history.columns.due' }),
      returned: intl.formatMessage({ id: 'ui-users.accounts.history.columns.returned' }),
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
          style={{ float: 'right', marginLeft: '20px' }}
          group
          pullRight
        >
          <Button data-role="toggle" bottomMargin2><FormattedMessage id="ui-users.accounts.history.button.select" /></Button>
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
            <Button id="open-accounts">
              <FormattedMessage id="ui-users.accounts.open" />
            </Button>
            <Button id="closed-accounts">
              <FormattedMessage id="ui-users.accounts.closed" />
            </Button>
            <Button id="all-accounts">
              <FormattedMessage id="ui-users.accounts.all" />
            </Button>
          </SegmentedControl>
        </Col>
      </Row>
    );

    const selected = parseFloat(this.state.selected) || 0;

    let balance = 0;
    accounts.forEach((a) => {
      balance += a.remaining;
    });

    const header1 = (
      <Row style={{ width: '80%' }}>
        <Col xs={7}>
          {' '}
          {closeMenu}
          {' '}
        </Col>
        <Col xs={4}>
          <Row>
            <Col>
              <b>{`Fees/Fines - ${getFullName(user)} (${_.upperFirst(patronGroup.group)})`}</b>
            </Col>
          </Row>
          <Row>
            <Col>
              <div style={{ margin: '5px 5px 5px 40px' }}>
              Outstanding Balance:
                {' '}
                { (user.id === (accounts[0] || {}).userId) ? parseFloat(balance || 0).toFixed(2) : '0.00'}
              </div>
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
            <Pane defaultWidth="fill" heigth="80%" header={header}>
              <Menu
                user={user}
                showFilters={this.state.showFilters}
                filters={filters}
                balance={(user.id === (accounts[0] || {}).userId) ? balance : 0}
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
                accounts={this.accounts}
                selectedAccounts={selectedAccounts}
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

export default injectIntl(AccountsHistory);
