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
import { filterState } from '@folio/stripes-components/lib/FilterGroups';
import makeQueryFunction from '@folio/stripes-components/util/makeQueryFunction';
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

let render = true;
let tab = false;

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
    query: { initialValue: {} },
    feefineshistory: {
      type: 'okapi',
      records: 'accounts',
      path: 'accounts',
      recordsRequired: '%{activeRecord.records}',
      perRequest: 30,
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
      locale: PropTypes.string.isRequired,
      connect: PropTypes.func.isRequired,
    }).isRequired,
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

    this.state = {
      showFilters: false,
      selectedAccounts: [],
      selected: 0,
      actions: {
        cancellation: false,
        pay: false,
        regular: false,
        waiveModal: false,
        quickpaydown: true,
        regularpayment: false,
        waive: false,
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
    this.addRecord = false;
    this.editRecord = 0;

    this.transitionToParams = values => this.props.parentMutator.query.update(values);
    this.handleFilterChange = handleFilterChange.bind(this);
    this.handleFilterClear = handleFilterClear.bind(this);
    this.filterState = filterState.bind(this);

    const initialQuery = queryString.parse(props.location.search) || {};
    this.initialFilters = initialQuery.f;
  }

  componentDidMount() {
    render = true;
    filterConfig[0].values = [{}];
    filterConfig[1].values = [{}];
    filterConfig[2].values = [{}];
    filterConfig[3].values = [{}];
    this.props.mutator.activeRecord.update({ records: 30 });
    this.props.mutator.user.update({ id: this.props.user.id });
  }

  shouldComponentUpdate(nextProps, nextState) {
    let accounts = _.get(nextProps.resources, ['feefineshistory', 'records'], []);
    const history = _.get(this.props.resources, ['feefineshistory', 'records'], []);
    const nextHistory = _.get(nextProps.resources, ['feefineshistory', 'records'], []);
    const query = nextProps.location.search ? queryString.parse(nextProps.location.search) : {};
    if (query.layer === 'open-accounts') {
      accounts = accounts.filter(a => a.status.name === 'Open') || [];// a.status.name
    } else if (query.layer === 'closed-accounts') {
      accounts = accounts.filter(a => a.status.name === 'Closed') || [];// a.status.name
    }
    if ((render && accounts.length !== 0 && history !== nextHistory) || tab) {
      const feeFineTypes = count(accounts.map(a => (a.feeFineType)));
      const feeFineOwners = count(accounts.map(a => (a.feeFineOwner)));
      const paymentStatus = count(accounts.map(a => (a.paymentStatus.name)));// a.paymentStatus.name
      const itemTypes = count(accounts.map(a => (a.materialType)));// a.materialType
      filterConfig[0].values = feeFineOwners.map(o => ({ name: `${o.name}(${o.size})`, cql: o.name }));
      filterConfig[1].values = paymentStatus.map(s => ({ name: `${s.name}(${s.size})`, cql: s.name }));
      filterConfig[2].values = feeFineTypes.map(f => ({ name: `${f.name}(${f.size})`, cql: f.name }));
      filterConfig[3].values = itemTypes.map(i => ({ name: `${i.name}(${i.size})`, cql: i.name }));
      render = false;
      tab = false;
    }
    const props = this.props;
    return history !== nextHistory ||
      props.location !== nextProps.location ||
      props.addRecord !== nextProps.addRecord ||
      this.state !== nextState;
  }

  componentDidUpdate(prevProps) {
    if (this.addRecord !== this.props.addRecord) {
      if (!this.addRecord) prevProps.mutator.activeRecord.update({ records: 31 });
      else prevProps.mutator.activeRecord.update({ records: 30 });
      this.addRecord = this.props.addRecord;
    }
    if (this.editRecord !== 0) {
      if (this.editRecord === 1) prevProps.mutator.activeRecord.update({ records: 31 });
      else prevProps.mutator.activeRecord.update({ records: 30 });
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
    tab = true;
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

  render() {
    const { user, patronGroup, resources } = this.props;

    const query = this.props.location.search ? queryString.parse(this.props.location.search) : {};

    const accounts = _.get(resources, ['feefineshistory', 'records'], []);
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

    const firstMenu = (
      <PaneMenu>
        <IconButton
          icon="search"
          onClick={this.toggleFilterPane}
          badgeCount={accounts.length ? badgeCount : undefined}
        />
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

    balance = parseFloat(balance).toFixed(2);

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
              Outstanding Balance {balance}
            </Col>
          </Row>
        </Col>
      </Row>
    );


    return (
      <Paneset>
        <Pane
          defaultWidth="100%"
          header={header1}
        >
          <Paneset>
            <Filters
              query={query}
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
                patronGroup={patronGroup}
                handleOptionsChange={this.handleOptionsChange}
                onClickViewChargeFeeFine={this.props.onClickViewChargeFeeFine}
              />

              <Row>
                {(query.layer === 'open-accounts') ?
                  (<this.connectedOpenAccounts
                    {...this.props}
                    accounts={open}
                    onChangeSelected={this.onChangeSelected}
                    onChangeActions={this.onChangeActions}
                  />) : ''
                }
                {(query.layer === 'closed-accounts') ?
                  (<this.connectedClosedAccounts
                    {...this.props}
                    accounts={closed}
                    onChangeSelected={this.onChangeSelected}
                    onChangeActions={this.onChangeActions}
                  />) : ''
                }
                {(query.layer === 'all-accounts') ?
                  (<this.connectedAllAccounts
                    {...this.props}
                    accounts={accounts}
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
