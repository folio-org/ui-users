import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import Button from '@folio/stripes-components/lib/Button';
import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';
import FilterGroups, { onChangeFilter as commonChangeFilter } from '@folio/stripes-components/lib/FilterGroups';
import TextField from '@folio/stripes-components/lib/TextField';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import SegmentedControl from '@folio/stripes-components/lib/SegmentedControl';
import transitionToParams from '@folio/stripes-components/util/transitionToParams';
import removeQueryParam from '@folio/stripes-components/util/removeQueryParam';
import { UncontrolledDropdown } from '@folio/stripes-components/lib/Dropdown';
import MenuItem from '@folio/stripes-components/lib/MenuItem';
import DropdownMenu from '@folio/stripes-components/lib/DropdownMenu';
import Icon from '@folio/stripes-components/lib/Icon';
import makeQueryFunction from './queryFunction';
import { getFullName } from './util';
import OpenAccounts from './lib/OpenAccounts';
import AllAccounts from './lib/AllAccounts';
import ClosedAccounts from './lib/ClosedAccounts';

const initialFilterState = (config, filters) => {
  const state = {};

  if (filters) {
    const fullNames = filters.split(',');
    for (let i = 0; i < fullNames.length; i++) {
      state[fullNames[i]] = true;
    }
  }

  return state;
};

const count = (array) => {
  const list = [];
  const countList = [];
  const result = [];
  array.forEach((a) => {
    const index = list.indexOf(a);
    if (index === -1) {
      list.push(a);
      countList.push(1);
    } else {
      countList[index]++;
    }
  });
  for (let i = 0; i < list.length; i++) {
    if (list[i] !== undefined) {
      result.push({ name: list[i], size: countList[i] });
    }
  }
  return result;
};


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
const search = {};

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
    user: PropTypes.object,
    onCancel: PropTypes.func.isRequired,
    onClickViewChargeFeeFine: PropTypes.func.isRequired,
    openAccounts: PropTypes.bool,
    patronGroup: PropTypes.object,
    mutator: PropTypes.shape({
      user: PropTypes.shape({
        update: PropTypes.func.isRequired,
      }),
    }),
    history: PropTypes.object,
    location: PropTypes.object,
  };

  static manifest = Object.freeze({
    feefineshistory: {
      type: 'okapi',
      records: 'feefinehistory',
      path: 'feefinehistory',
      recordsRequired: 30,
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
    user: {},
  });

  constructor(props) {
    super(props);

    const query = props.location.search ? queryString.parse(props.location.search) : {};

    this.state = {
      filters: initialFilterState(filterConfig, query.f),
      showFilters: false,
      selected: 0,
      searchTerm: query.q || '',
      activeTab: '',
      actions: {
        quickpaydown: true,
        regularpayment: false,
        waive: false,
        refund: false,
        transfer: false,
      },
    };

    this.transitionToParams = transitionToParams.bind(this);
    this.removeQueryParam = removeQueryParam.bind(this);
    this.onChangeFilter = commonChangeFilter.bind(this);
    this.onClosePanel = this.onClosePanel.bind(this);
    this.onClickPanel = this.onClickPanel.bind(this);
    this.onChangeSearch = this.onChangeSearch.bind(this);
    this.handleActivate = this.handleActivate.bind(this);
    this.handleOptionsChange = this.handleOptionsChange.bind(this);
    this.onChangeActions = this.onChangeActions.bind(this);
    this.onChangeSelected = this.onChangeSelected.bind(this);

    this.connectedOpenAccounts = props.stripes.connect(OpenAccounts);
    this.connectedClosedAccounts = props.stripes.connect(ClosedAccounts);
    this.connectedAllAccounts = props.stripes.connect(AllAccounts);
  }

  componentWillMount() {
    render = true;
    filterConfig[0].values = [];
    filterConfig[1].values = [];
    filterConfig[2].values = [];
    filterConfig[3].values = [];
    this.props.mutator.user.update({ id: this.props.user.id });
    // this.props.history.push(`${this.props.location.pathname}?layer=open-accounts`);
  }

  componentDidMount() {
    const activeTab = (this.props.openAccounts) ? 'open' : 'closed';
    this.setState({
      activeTab,
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    let accounts = _.get(nextProps.resources, ['feefineshistory', 'records'], []);
    if (nextState.activeTab === 'open') {
      accounts = accounts.filter(a => a.status === 'Open');
    } else if (nextState.activeTab === 'closed') {
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

  onChangeActions(actions) {
    this.setState({
      actions,
    });
  }

  handleActivate({ id }) {
    tab = true;
    this.transitionToParams({ layer: id });
    this.setState({
      activeTab: id,
      selected: 0,
    });
  }

  handleOptionsChange(key, e) {
    e.preventDefault();
    e.stopPropagation();

    if (key.action && this[key.action]) {
      this[key.action](key.loan);
    }
  }

  onChangeSearch(e) {
    this.setState({
      searchTerm: e.target.value,
    });
    this.transitionToParams({ q: e.target.value });
  }

  onClosePanel() {
    this.setState({
      showFilters: false,
    });
  }

  onClickPanel() {
    this.setState({
      showFilters: true,
    });
  }

  onChangeSelected(value) {
    this.setState({
      selected: value,
    });
  }

  updateFilters(filters) {
    this.transitionToParams({ f: Object.keys(filters).filter(key => filters[key]).join(',') });
  }

  render() {
    const { user, patronGroup, resources } = this.props;

    const accounts = _.get(resources, ['feefineshistory', 'records'], []);
    const open = accounts.filter(a => a.status === 'Open');
    const closed = accounts.filter(a => a.status === 'Closed');
    const filter = Object.values(this.state.filters);
    const filtersApplied = filter.indexOf(true);

    const selected = this.state.selected || 0;
    const query = this.props.location.search ? queryString.parse(this.props.location.search) : {};

    let balance = 0;
    accounts.forEach((a) => {
      balance = a.remaining + balance;
    });

    const rightButton = {
      marginRight: '10px',
      float: 'right',
    };

    const badge = {
      background: '#aaa',
      color: '#FFF',
      padding: '3px 10px',
      marginLeft: '5px',
      borderRadius: '10px',
    };

    return (
      <Paneset>
        {(this.state.showFilters) ?
          <Pane defaultWidth="16%" dismissible onClose={this.onClosePanel} paneTitle="Search and Filter" >
            <TextField onChange={this.onChangeSearch} />
            <FilterGroups
              config={filterConfig}
              filters={this.state.filters}
              onChangeFilter={this.onChangeFilter}
            />
          </Pane>
          : ''
        }
        <Pane defaultWidth="fill" paneTitle="Lo demas">
          <div>
            <Row>
              <Col xs={11}>
                {(this.state.showFilters) ? '' : <Button onClick={this.onClickPanel}><Icon icon="search" /></Button>}
                Patron: <a
                  href="#"
                  onClick={() => {
                    this.props.history.push(`/users/view/${this.props.user.id}`);
                    this.props.onCancel();
                  }}
                >{getFullName(user)}</a> ({_.upperFirst(patronGroup.group)})
                {((filtersApplied !== -1) && (this.state.showFilters === false))
                  ? <img alt="" src="https://png.icons8.com/color/40/f39c12/filled-filter.png" />
                  : ''
                }
              </Col>
              <Col xs={1}><Button onClick={this.props.onCancel} style={rightButton} /></Col>
            </Row>
            <Row>
              <Col>Outstanding Balance: {balance}</Col><Col style={{ marginLeft: '10px' }}>
                {(selected !== 0) ?
                  `Selected: ${selected}`
                  : ''
                }
              </Col>
            </Row>
            <Row>
              <Col xs={12}><Button style={rightButton} onClick={() => this.props.onClickViewChargeFeeFine('')}>+ New</Button></Col>
            </Row>
            <Row>
              <Col xsOffset={1} xs={3}>
                <SegmentedControl activeId={query.layer} onActivate={this.handleActivate}>
                  <Button id="open-accounts">Open<span style={badge}>{open.length}</span></Button>
                  <Button id="closed-accounts">Closed<span style={badge}>{closed.length}</span></Button>
                  <Button id="all-accounts">All<span style={badge}>{accounts.length}</span></Button>
                </SegmentedControl>
              </Col>
              <Col xs={8}>
                <img alt="" style={rightButton}src="https://png.icons8.com/ios/25/666666/upload.png" />
                <Button disabled={!this.state.actions.transfer} style={rightButton}>Transfer</Button>
                <Button disabled={!this.state.actions.refund} style={rightButton}>Refund</Button>
                <Button disabled={!this.state.actions.waive} style={rightButton}>Waive</Button>
                <UncontrolledDropdown
                  onSelectItem={this.handleOptionsChange}
                  style={rightButton}
                >
                  <Button data-role="toggle" style={rightButton}>Pay<img alt="" style={{ marginLeft: '10px' }} src="https://png.icons8.com/ios/12/ffffff/sort-down-filled.png" /></Button>
                  <DropdownMenu data-role="menu" overrideStyle={{ padding: '6px 0' }}>
                    <MenuItem>
                      <Button buttonStyle="dropdownItem">Quick Paydown</Button>
                    </MenuItem>
                    <MenuItem>
                      <Button disabled={!this.state.actions.regularpayment} buttonStyle="dropdownItem">Regular Payment</Button>
                    </MenuItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </Col>
            </Row>
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
                />) : ''
              }
            </Row>
          </div>


        </Pane>
      </Paneset>
    );
  }
}

export default AccountsHistory;
