import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import Button from '@folio/stripes-components/lib/Button';
import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';
import { onChangeFilter as commonChangeFilter } from '@folio/stripes-components/lib/FilterGroups';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import SegmentedControl from '@folio/stripes-components/lib/SegmentedControl';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import IconButton from '@folio/stripes-components/lib/IconButton';
import { Menu, Filters } from './lib/Accounts/lib/AccountsHistory';

import { Actions } from './lib/Accounts/Actions';

import makeQueryFunction from './queryFunction';
import { initialFilterState, count, getFullName } from './lib/Accounts/util';
import {
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
    cql: 'paymentStatus',
    values: [],
  }, {
    label: 'Fee/Fine Type',
    name: 'type',
    cql: 'feeFineType',
    values: [],
  }, {
    label: 'Item Type',
    name: 'material',
    cql: 'itemType',
    values: [],
  },
];

let render = true;
let tab = false;

class AccountsHistory extends React.Component {
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
  };

  static manifest = Object.freeze({
    feefineshistory: {
      type: 'okapi',
      records: 'feefinehistory',
      path: 'feefinehistory',
      recordsRequired: '%{activeRecord.records}',
      perRequest: 30,
      GET: {
        params: {
          query: makeQueryFunction(
            'cql.allRecords=1',
            'feeFineType="$QUERY*" or barcode="$QUERY*" or itemType="$QUERY" or item="$QUERY*" or feeFineOwner="$QUERY*" or paymentStatus="$QUERY"',
            { userId: 'userId' },
            filterConfig,
          ),
        },
        staticFallback: { params: {} },
      },
    },
    activeRecord: {},
    user: {},
  });

  constructor(props) {
    super(props);

    const query = props.location.search ? queryString.parse(props.location.search) : {};

    this.state = {
      filters: initialFilterState(filterConfig, query.f),
      showFilters: false,
      selected: 0,
      actions: {
        cancellation: false,
        pay: false,
        waiveModal: false,
        quickpaydown: true,
        regularpayment: false,
        waive: false,
        refund: false,
        transfer: false,
      },
    };

    this.onChangeFilter = commonChangeFilter.bind(this);
    this.onChangeSearch = this.onChangeSearch.bind(this);
    this.onClearSearch = this.onClearSearch.bind(this);
    this.handleActivate = this.handleActivate.bind(this);
    this.handleOptionsChange = this.handleOptionsChange.bind(this);
    this.onChangeActions = this.onChangeActions.bind(this);
    this.onChangeSelected = this.onChangeSelected.bind(this);
    this.onClearFilters = this.onClearFilters.bind(this);
    this.connectedOpenAccounts = props.stripes.connect(OpenAccounts);
    this.connectedClosedAccounts = props.stripes.connect(ClosedAccounts);
    this.connectedAllAccounts = props.stripes.connect(AllAccounts);
    this.connectedActions = props.stripes.connect(Actions);

    this.handleRecords = this.handleRecords.bind(this);
    this.accounts = [];
    this.addRecord = false;
  }

  componentWillMount() {
    render = true;
    filterConfig[0].values = [];
    filterConfig[1].values = [];
    filterConfig[2].values = [];
    filterConfig[3].values = [];
    this.props.mutator.activeRecord.update({ records: 30});
    this.props.mutator.user.update({ id: this.props.user.id });
  }

  componentWillReceiveProps(nextProps) {
    if(this.addRecord !== nextProps.addRecord) {
      if (!this.addRecord) this.props.mutator.activeRecord.update({ records: 31 });
      else this.props.mutator.activeRecord.update({ records: 30 });
      this.addRecord = nextProps.addRecord;
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log(nextState);
    console.log(this.state);
    let accounts = _.get(nextProps.resources, ['feefineshistory', 'records'], []);
    const query = nextProps.location.search ? queryString.parse(nextProps.location.search) : {};
    if (query.layer === 'open-accounts') {
      accounts = accounts.filter(a => a.status === 'Open');
    } else if (query.layer === 'closed-accounts') {
      accounts = accounts.filter(a => a.status === 'Closed');
    }
    if ((render && accounts.length !== 0) || tab) {
      const feeFineTypes = count(accounts.map(a => (a.feeFineType)));
      const feeFineOwners = count(accounts.map(a => (a.feeFineOwner)));
      const paymentStatus = count(accounts.map(a => (a.paymentStatus)));
      const itemTypes = count(accounts.map(a => (a.itemType)));
      filterConfig[0].values = feeFineOwners.map(o => ({ name: `${o.name}(${o.size})`, cql: o.name }));
      filterConfig[1].values = paymentStatus.map(s => ({ name: `${s.name}(${s.size})`, cql: s.name }));
      filterConfig[2].values = feeFineTypes.map(f => ({ name: `${f.name}(${f.size})`, cql: f.name }));
      filterConfig[3].values = itemTypes.map(i => ({ name: `${i.name}(${i.size})`, cql: i.name }));
      render = false;
      tab = false;
    }
    return true;
  }

  onChangeActions(actions, a) {
    this.setState({
      actions,
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
      actions: {
        regularpayment: false,
        waive: false,
        refund: false,
        transfer: false,
      },
    });
  }

  handleOptionsChange(key, e) {
    e.preventDefault();
    e.stopPropagation();

    if (key.action && this[key.action]) {
      this[key.action](key.loan);
    }
  }

  handleRecords() {
    this.addRecord = true;
  }

  onChangeSearch(e) {
    this.props.parentMutator.query.update({ q: e.target.value });
  }

  onClearSearch(e) {
    this.props.parentMutator.query.update({ q: '' });
  }

  onClearFilters(e) {
    this.props.parentMutator.query.update({ f: '' });
  }

  onChangeSelected(value) {
    this.setState({
      selected: value,
    });
  }

  updateFilters(filters) {
    this.props.parentMutator.query.update({ f: Object.keys(filters).filter(key => filters[key]).join(',') });
  }

  toggleFilterPane = () => {
    this.setState(prevState => ({ showFilters: !prevState.showFilters }));
  }

  render() {
    const { user, patronGroup, resources } = this.props;

    const query = this.props.location.search ? queryString.parse(this.props.location.search) : {};

    const accounts = _.get(resources, ['feefineshistory', 'records'], []);
    const open = accounts.filter(a => a.status === 'Open');
    const closed = accounts.filter(a => a.status === 'Closed');
    let badgeCount = accounts.length;
    if (query.layer === 'open-accounts') badgeCount = open.length;
    else if (query.layer === 'closed-accounts') badgeCount = closed.length;

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
            <Button id="open-accounts">Open</Button>
            <Button id="closed-accounts">Closed</Button>
            <Button id="all-accounts">All</Button>
          </SegmentedControl>
        </Col>
      </Row>
    );

    const selected = this.state.selected || 0;

    let balance = 0;
    accounts.forEach((a) => {
      balance = a.remaining + balance;
    });

    return (
      <Paneset>
        <Pane
          defaultWidth="100%"
          paneTitle={
            <div style={{ textAlign: 'center' }}>
              <strong>{`Fees/Fines-${getFullName(user)}(${_.upperFirst(patronGroup.group)})`}</strong>
              <div>
                Outstanding Balance {balance}
              </div>
            </div>
          }
          dismissible
          onClose={this.props.onCancel}
        >
          <Paneset>
            <Filters
              query={query}
              toggle={this.toggleFilterPane}
              showFilters={this.state.showFilters}
              onChangeSearch={this.onChangeSearch}
              onClearFilters={this.onClearFilters}
              onClearSearch={this.onClearSearch}
              filterConfig={filterConfig}
              filters={this.state.filters}
              onChangeFilter={this.onChangeFilter}
            />
            <Pane defaultWidth="fill" header={header}>
              <Menu
                user={user}
                showFilters={this.state.showFilters}
                filters={this.state.filters}
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
                    showConfirm={this.showConfirm}
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
              />
            </Pane>
          </Paneset>
        </Pane>
      </Paneset>
    );
  }
}

export default AccountsHistory;
