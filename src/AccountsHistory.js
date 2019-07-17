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
  PaneHeader,
  PaneMenu,
  PaneHeaderIconButton,
  Button,
  Dropdown,
  DropdownMenu,
  Row,
  Col,
  Checkbox,
  ButtonGroup,
  filterState,
} from '@folio/stripes/components';
import { makeQueryFunction } from '@folio/stripes/smart-components';
import css from './AccountsHistory.css';

import { getFullName } from './util';
import { Actions } from './components/Accounts/Actions';
import { count, handleFilterChange, handleFilterClear } from './components/Accounts/accountFunctions';

import {
  Menu,
  Filters,
  ViewFeesFines,
} from './components/Accounts';

const filterConfig = [
  {
    label: <FormattedMessage id="ui-users.feefines.ownerLabel" />,
    name: 'owner',
    cql: 'feeFineOwner',
    values: [],
  }, {
    label: <FormattedMessage id="ui-users.accounts.history.columns.status" />,
    name: 'status',
    cql: 'paymentStatus.name',
    values: [],
  }, {
    label: <FormattedMessage id="ui-users.details.field.feetype" />,
    name: 'type',
    cql: 'feeFineType',
    values: [],
  }, {
    label: <FormattedMessage id="ui-users.details.field.type" />,
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

const controllableColumns = [
  'metadata.createdDate',
  'metadata.updatedDate',
  'feeFineType',
  'amount',
  'remaining',
  'paymentStatus.name',
  'feeFineOwner',
  'title',
  'barcode',
  'callNumber',
  'dueDate',
  'returnedDate',
];

const possibleColumns = [
  '  ',
  'metadata.createdDate',
  'metadata.updatedDate',
  'feeFineType',
  'amount',
  'remaining',
  'paymentStatus.name',
  'feeFineOwner',
  'title',
  'barcode',
  'callNumber',
  'dueDate',
  'returnedDate',
  ' ',
];

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
      perRequest: 100,
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
    activeRecord: { records: 100 },
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
      query: PropTypes.object,
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
    num: PropTypes.number,
    handleAddRecords: PropTypes.func,
  };

  constructor(props) {
    super(props);

    const visibleColumns = controllableColumns.map(columnName => ({
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
        transferModal: false,
        transferMany: false,
        refund: false,
        transfer: false,
      },
    };

    this.handleActivate = this.handleActivate.bind(this);
    this.onChangeActions = this.onChangeActions.bind(this);
    this.onChangeSelected = this.onChangeSelected.bind(this);
    this.onChangeSelectedAccounts = this.onChangeSelectedAccounts.bind(this);
    this.connectedViewFeesFines = props.stripes.connect(ViewFeesFines);
    this.connectedActions = props.stripes.connect(Actions);

    this.accounts = [];
    this.addRecord = 100;
    this.editRecord = 0;

    this.transitionToParams = values => this.props.parentMutator.query.update(values);
    this.handleFilterChange = handleFilterChange.bind(this);
    this.handleFilterClear = handleFilterClear.bind(this);
    this.filterState = filterState.bind(this);
    this.getVisibleColumns = this.getVisibleColumns.bind(this);
    this.renderCheckboxList = this.renderCheckboxList.bind(this);
    this.toggleColumn = this.toggleColumn.bind(this);
    this.onDropdownClick = this.onDropdownClick.bind(this);

    const initialQuery = queryString.parse(props.location.search) || {};
    this.initialFilters = initialQuery.f;
  }

  componentDidMount() {
    this.props.mutator.activeRecord.update({ records: 100, comments: 200, userId: this.props.user.id });
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
        selected += (nextAccounts.find(ac => ac.id === a.id).remaining * 100);
      });
      this.setState({ selected: selected / 100 });
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
        cancellation: false,
        pay: false,
        regular: false,
        regularpayment: false,
        waive: false,
        waiveModal: false,
        waiveMany: false,
        transferModal: false,
        transferMany: false,
        refund: false,
        transfer: false,
      },
    });
  }

  handleEdit = (val) => {
    this.props.handleAddRecords();
    this.editRecord = val;
  }

  onChangeSearch = (e) => {
    const query = e.target.value;
    this.transitionToParams({ q: query });
  }

  onClearSearch = () => {
    this.transitionToParams({ q: '' });
  }

  onChangeSelected(value, accounts = []) {
    this.setState({
      selected: value,
      selectedAccounts: accounts,
    });
    this.accounts = accounts;
  }

  onChangeSelectedAccounts(selectedAccounts) {
    this.setState({ selectedAccounts });
    this.accounts = selectedAccounts;
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
          <li id={`column-item-${i}`} key={`columnitem-${i}`}>
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

    const columnsToDisplay = possibleColumns.filter((e) => visibleColumnsMap[e] === undefined || visibleColumnsMap[e] === true);
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
      location,
      user,
      currentUser,
      patronGroup,
      resources,
      intl,
    } = this.props;

    const query = location.search ? queryString.parse(location.search) : {};

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

    const columnMapping = {
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

    const firstMenu = (
      <PaneMenu>
        <PaneHeaderIconButton
          id="history-first-menu"
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
          <Button
            id="select-columns"
            data-role="toggle"
            bottomMargin0
          >
            <FormattedMessage id="ui-users.accounts.history.button.select" />
          </Button>
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
        <Col xs={2}>
          {firstMenu}
        </Col>
        <Col xsOffset={2} xs={5}>
          <ButtonGroup
            fullWidth
            activeId={query.layer}
            onActivate={this.handleActivate}
          >
            <Button
              buttonStyle={query.layer === 'open-accounts' ? 'primary' : 'default'}
              bottomMargin0
              id="open-accounts"
              onClick={() => this.handleActivate({ id: 'open-accounts' })}
            >
              <FormattedMessage id="ui-users.accounts.open" />
            </Button>
            <Button
              buttonStyle={query.layer === 'closed-accounts' ? 'primary' : 'default'}
              bottomMargin0
              id="closed-accounts"
              onClick={() => this.handleActivate({ id: 'closed-accounts' })}
            >
              <FormattedMessage id="ui-users.accounts.closed" />
            </Button>
            <Button
              buttonStyle={query.layer === 'all-accounts' ? 'primary' : 'default'}
              bottomMargin0
              id="all-accounts"
              onClick={() => this.handleActivate({ id: 'all-accounts' })}
            >
              <FormattedMessage id="ui-users.accounts.all" />
            </Button>
          </ButtonGroup>
        </Col>
      </Row>
    );

    const selected = parseFloat(this.state.selected) || 0;

    let balance = 0;
    accounts.forEach((a) => {
      balance += (parseFloat(a.remaining) * 100);
    });
    balance /= 100;

    const outstandingBalance = (user.id === (accounts[0] || {}).userId)
      ? parseFloat(balance || 0).toFixed(2)
      : '0.00';

    const visibleColumns = this.getVisibleColumns();

    return (
      <Paneset>
        <Pane
          defaultWidth="100%"
          dismissible
          padContent={false}
          onClose={this.props.onCancel}
          paneTitle={(
            <FormattedMessage id="ui-users.accounts.title">
              {(title) => `${title} - ${getFullName(user)} (${_.upperFirst(patronGroup.group)})`}
            </FormattedMessage>
          )}
          paneSub={(
            <FormattedMessage id="ui-users.accounts.outstandingBalance">
              {(title) => `${title} ${outstandingBalance}`}
            </FormattedMessage>
          )}
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
            <section className={css.pane}>
              <PaneHeader id="search-filter-paneheader" header={header} />
              <Menu
                {...this.props}
                user={user}
                showFilters={this.state.showFilters}
                filters={filters}
                balance={(user.id === (accounts[0] || {}).userId) ? balance : 0}
                selected={selected}
                actions={this.state.actions}
                query={query}
                onChangeActions={this.onChangeActions}
                patronGroup={patronGroup}
                onClickViewChargeFeeFine={this.props.onClickViewChargeFeeFine}
              />
              <div className={css.paneContent}>
                {(query.layer === 'open-accounts') ?
                  (<this.connectedViewFeesFines
                    {...this.props}
                    accounts={(user.id === (accounts[0] || {}).userId) ? open : []}
                    visibleColumns={visibleColumns}
                    selectedAccounts={selectedAccounts}
                    onChangeSelected={this.onChangeSelected}
                    onChangeActions={this.onChangeActions}
                  />) : ''
                }
                {(query.layer === 'closed-accounts') ?
                  (<this.connectedViewFeesFines
                    {...this.props}
                    accounts={(user.id === (accounts[0] || {}).userId) ? closed : []}
                    visibleColumns={visibleColumns}
                    selectedAccounts={selectedAccounts}
                    onChangeSelected={this.onChangeSelected}
                    onChangeActions={this.onChangeActions}
                  />) : ''
                }
                {(query.layer === 'all-accounts') ?
                  (<this.connectedViewFeesFines
                    {...this.props}
                    accounts={(user.id === (accounts[0] || {}).userId) ? accounts : []}
                    visibleColumns={visibleColumns}
                    selectedAccounts={selectedAccounts}
                    onChangeSelected={this.onChangeSelected}
                    onChangeActions={this.onChangeActions}
                  />) : ''
                }
              </div>
              <this.connectedActions
                actions={this.state.actions}
                layer={query.layer}
                onChangeActions={this.onChangeActions}
                user={user}
                currentUser={currentUser}
                accounts={this.accounts}
                selectedAccounts={selectedAccounts}
                onChangeSelectedAccounts={this.onChangeSelectedAccounts}
                balance={balance}
                handleEdit={this.handleEdit}
              />
            </section>
          </Paneset>
        </Pane>
      </Paneset>
    );
  }
}

export default injectIntl(AccountsHistory);
