import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import Route from 'react-router-dom/Route';
import queryString from 'query-string';
import fetch from 'isomorphic-fetch';

import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import Button from '@folio/stripes-components/lib/Button';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import FilterPaneSearch from '@folio/stripes-components/lib/FilterPaneSearch';
import Layer from '@folio/stripes-components/lib/Layer';
import FilterGroups, { initialFilterState, onChangeFilter as commonChangeFilter } from '@folio/stripes-components/lib/FilterGroups';
import SRStatus from '@folio/stripes-components/lib/SRStatus';
import Notes from '@folio/stripes-components/lib/structures/Notes';

import transitionToParams from '@folio/stripes-components/util/transitionToParams';
import makeQueryFunction from '@folio/stripes-components/util/makeQueryFunction';
import IfPermission from '@folio/stripes-components/lib/IfPermission';

import UserForm from './UserForm';
import ViewUser from './ViewUser';

import contactTypes from './data/contactTypes';
import { toUserAddresses } from './converters/address';
import packageInfo from './package';

const INITIAL_RESULT_COUNT = 30;
const RESULT_COUNT_INCREMENT = 30;

const filterConfig = [
  {
    label: 'User status',
    name: 'active',
    cql: 'active',
    values: [
      { name: 'Active', cql: 'true' },
      { name: 'Inactive', cql: 'false' },
    ],
  },
  {
    label: 'Patron group',
    name: 'pg',
    cql: 'patronGroup',
    values: [], // will be filled in by componentWillUpdate
  },
];

class Users extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      logger: PropTypes.shape({
        log: PropTypes.func.isRequired,
      }).isRequired,
      connect: PropTypes.func.isRequired,
      hasPerm: PropTypes.func.isRequired,
    }).isRequired,
    data: PropTypes.object.isRequired,
    resources: PropTypes.shape({
      users: PropTypes.shape({
        hasLoaded: PropTypes.bool.isRequired,
        other: PropTypes.shape({
          totalRecords: PropTypes.number.isRequired,
        }),
        isPending: PropTypes.bool.isPending,
        successfulMutations: PropTypes.arrayOf(
          PropTypes.shape({
            record: PropTypes.shape({
              id: PropTypes.string.isRequired,
              username: PropTypes.string.isRequired,
            }).isRequired,
          }),
        ),
      }),
    }).isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      search: PropTypes.string,
    }).isRequired,
    match: PropTypes.shape({
      path: PropTypes.string.isRequired,
    }).isRequired,
    mutator: PropTypes.shape({
      addUserMode: PropTypes.shape({
        replace: PropTypes.func,
      }),
      userCount: PropTypes.shape({
        replace: PropTypes.func,
      }),
      users: PropTypes.shape({
        POST: PropTypes.func,
      }),
    }).isRequired,
    okapi: PropTypes.shape({
      url: PropTypes.string.isRequired,
      tenant: PropTypes.string.isRequired,
      token: PropTypes.string.isRequired,
    }).isRequired,
    onSelectRow: PropTypes.func,
  };

  static manifest = Object.freeze({
    addUserMode: { initialValue: { mode: false } },
    userCount: { initialValue: INITIAL_RESULT_COUNT },
    users: {
      type: 'okapi',
      records: 'users',
      recordsRequired: '%{userCount}',
      perRequest: RESULT_COUNT_INCREMENT,
      path: 'users',
      GET: {
        params: {
          query: makeQueryFunction(
            'username=*',
            'username="$QUERY*" or personal.firstName="$QUERY*" or personal.lastName="$QUERY*" or personal.email="$QUERY*" or barcode="$QUERY*" or id="$QUERY*" or externalSystemId="$QUERY*"',
            {
              Active: 'active',
              Name: 'personal.lastName personal.firstName',
              'Patron Group': 'patronGroup.group',
              'User ID': 'username',
              Barcode: 'barcode',
              Email: 'personal.email',
            },
            filterConfig,
          ),
        },
        staticFallback: { params: {} },
      },
    },
    patronGroups: {
      type: 'okapi',
      path: 'groups',
      records: 'usergroups',
    },
    addressTypes: {
      type: 'okapi',
      path: 'addresstypes',
      records: 'addressTypes',
    },
  });

  constructor(props) {
    super(props);

    const query = props.location.search ? queryString.parse(props.location.search) : {};

    let initiallySelected = {};
    if (/users\/view/.test(this.props.location.pathname)) {
      const id = /view\/(.*)\//.exec(this.props.location.pathname)[1];
      initiallySelected = { id };
    }

    this.state = {
      filters: initialFilterState(filterConfig, query.filters),
      selectedItem: initiallySelected,
      searchTerm: query.query || '',
      sortOrder: query.sort || '',
      showNotesPane: false,
    };

    this.okapi = props.okapi;

    this.commonChangeFilter = commonChangeFilter.bind(this);
    this.transitionToParams = transitionToParams.bind(this);
    this.connectedViewUser = props.stripes.connect(ViewUser);

    const logger = props.stripes.logger;
    this.log = logger.log.bind(logger);

    this.anchoredRowFormatter = this.anchoredRowFormatter.bind(this);

    this.resultsList = null;
    this.SRStatus = null;

    this.toggleNotes = this.toggleNotes.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const resource = this.props.resources.users;
    if (resource) {
      const sm = nextProps.resources.users.successfulMutations;
      if (sm.length > resource.successfulMutations.length)
        this.onSelectRow(undefined, { id: sm[0].record.id, username: sm[0].record.username });
    }

    if (resource && resource.isPending && !nextProps.resources.users.isPending) {
      this.log('event', 'new search-result');
      const resultAmount = nextProps.resources.users.other.totalRecords;
      this.SRStatus.sendMessage(`Search returned ${resultAmount} result${resultAmount !== 1 ? 's' : ''}`);
    }
  }

  componentWillUpdate() {
    const pg = this.props.data.patronGroups;
    if (pg && pg.length) {
      filterConfig[1].values = pg.map(rec => ({ name: rec.group, cql: rec.id }));
    }
  }

  onClearSearch = () => {
    const path = (_.get(packageInfo, ['stripes', 'home']) ||
                  _.get(packageInfo, ['stripes', 'route']));
    this.setState({
      searchTerm: '',
      sortOrder: 'Name',
      filters: { 'active.Active': true },
    });
    this.log('action', `cleared search: navigating to ${path}`);
    this.props.history.push(path);
  }

  onSort = (e, meta) => {
    const newOrder = meta.alias;
    const oldOrder = this.state.sortOrder || '';

    const orders = oldOrder ? oldOrder.split(',') : [];
    if (orders[0] && newOrder === orders[0].replace(/^-/, '')) {
      orders[0] = `-${orders[0]}`.replace(/^--/, '');
    } else {
      orders.unshift(newOrder);
    }

    const sortOrder = orders.slice(0, 2).join(',');
    this.log('action', `sorted by ${sortOrder}`);
    this.setState({ sortOrder });
    this.transitionToParams({ sort: sortOrder });
  }

  onSelectRow = this.props.onSelectRow ? this.props.onSelectRow : (e, meta) => {
    const userId = meta.id;
    const username = meta.username;
    this.log('action', `clicked ${userId}, selected user =`, meta);
    this.setState({ selectedItem: meta });
    this.props.history.push(`/users/view/${userId}/${username}${this.props.location.search}`);
  }

  onClickAddNewUser = (e) => {
    if (e) e.preventDefault();
    this.log('action', 'clicked "add new user"');
    this.props.mutator.addUserMode.replace({ mode: true });
  }

  onClickCloseNewUser = (e) => {
    if (e) e.preventDefault();
    this.log('action', 'clicked "close new user"');
    this.props.mutator.addUserMode.replace({ mode: false });
  }

  onChangeFilter = (e) => {
    this.props.mutator.userCount.replace(INITIAL_RESULT_COUNT);
    this.commonChangeFilter(e);
  }

  onChangeSearch = (e) => {
    const query = e.target.value;
    this.props.mutator.userCount.replace(INITIAL_RESULT_COUNT);
    this.setState({ searchTerm: query });
    this.performSearch(query);
  }

  onNeedMore = () => {
    this.props.mutator.userCount.replace(this.props.data.userCount + RESULT_COUNT_INCREMENT);
  }

  getRowURL(rowData) {
    return `/users/view/${rowData.id}/${rowData.username}${this.props.location.search}`;
  }

  performSearch = _.debounce((query) => {
    this.log('action', `searched for '${query}'`);
    this.transitionToParams({ query });
  }, 350);

  updateFilters = (filters) => { // provided for onChangeFilter
    this.transitionToParams({ filters: Object.keys(filters).filter(key => filters[key]).join(',') });
  }

  create = (data) => {
    if (data.personal.addresses) {
      data.personal.addresses = toUserAddresses(data.personal.addresses, this.props.data.addressTypes); // eslint-disable-line no-param-reassign
    }

    // extract creds object from user object
    const creds = Object.assign({}, data.creds, { username: data.username });
    if (data.creds) delete data.creds; // eslint-disable-line no-param-reassign
    // POST user record
    this.props.mutator.users.POST(data);
    // POST credentials, permission-user, permissions;
    this.postCreds(data.username, creds);
   
    this.onClickCloseNewUser();
  }

  postCreds = (username, creds) => {
    this.log('xhr', `POST credentials for new user '${username}':`, creds);
    const localCreds = Object.assign({}, creds, creds.password ? {} : { password: '' });
    fetch(`${this.okapi.url}/authn/credentials`, {
      method: 'POST',
      headers: Object.assign({}, { 'X-Okapi-Tenant': this.okapi.tenant, 'X-Okapi-Token': this.okapi.token, 'Content-Type': 'application/json' }),
      body: JSON.stringify(localCreds),
    }).then((response) => {
      if (response.status >= 400) {
        this.log('xhr', 'Users. POST of creds failed.');
      } else {
        this.postPerms(username, []); // create empty permissions user
      }
    });
  }

  postPerms = (username, perms) => {
    this.log('xhr', `POST permissions for new user '${username}':`, perms);
    fetch(`${this.okapi.url}/perms/users`, {
      method: 'POST',
      headers: Object.assign({}, { 'X-Okapi-Tenant': this.okapi.tenant, 'X-Okapi-Token': this.okapi.token, 'Content-Type': 'application/json' }),
      body: JSON.stringify({ username, permissions: perms }),
    }).then((response) => {
      if (response.status >= 400) {
        this.log('xhr', 'Users. POST of users permissions failed.');
      } else {
        // nothing to do
      }
    });
  }

  collapseDetails = () => {
    this.setState({
      selectedItem: {},
    });
    this.props.history.push(`${this.props.match.path}${this.props.location.search}`);
  }

  toggleNotes() {
    this.setState((curState) => {
      const show = !curState.showNotesPane;
      return {
        showNotesPane: show,
      };
    });
  }

  // custom row formatter to wrap rows in anchor tags.
  anchoredRowFormatter(
    { rowIndex,
      rowClass,
      rowData,
      cells,
      rowProps,
      labelStrings,
    },
  ) {
    return (
      <a
        href={this.getRowURL(rowData)} key={`row-${rowIndex}`}
        aria-label={labelStrings && labelStrings.join('...')}
        role="listitem"
        className={rowClass}
        {...rowProps}
      >
        {cells}
      </a>
    );
  }

  render() {
    const { data, resources, stripes } = this.props;
    const users = (resources.users || {}).records || [];

    /* searchHeader is a 'custom pane header'*/
    const searchHeader = <FilterPaneSearch searchFieldId="input-user-search" onChange={this.onChangeSearch} onClear={this.onClearSearch} resultsList={this.resultsList} value={this.state.searchTerm} placeholder={'Search'} />;

    const newUserButton = (
      <IfPermission perm="users.item.post">
        <IfPermission perm="login.item.post">
          <IfPermission perm="perms.users.item.post">
            <PaneMenu>
              <Button id="clickable-newuser" title="Add New User" onClick={this.onClickAddNewUser} buttonStyle="primary paneHeaderNewButton">+ New</Button>
            </PaneMenu>
          </IfPermission>
        </IfPermission>
      </IfPermission>
    );

    const resultsFormatter = {
      Active: user => user.active,
      Name: user => `${_.get(user, ['personal', 'lastName'], '')}, ${_.get(user, ['personal', 'firstName'], '')}`,
      Barcode: user => user.barcode,
      'Patron Group': (user) => {
        const pg = this.props.data.patronGroups.filter(g => g.id === user.patronGroup)[0];
        return pg ? pg.group : '?';
      },
      'User ID': user => user.username,
      Email: user => _.get(user, ['personal', 'email']),
    };

    const detailsPane = (
      this.props.stripes.hasPerm('users.item.get') ?
        (<Route
          path={`${this.props.match.path}/view/:userid/:username`}
          render={props => <this.connectedViewUser stripes={stripes} okapi={this.okapi} paneWidth="44%" onClose={this.collapseDetails} addressTypes={data.addressTypes} notesToggle={this.toggleNotes} {...props} />}
        />) :
        (<div
          style={{
            position: 'absolute',
            right: '1rem',
            bottom: '1rem',
            width: '34%',
            zIndex: '9999',
            padding: '1rem',
            backgroundColor: '#fff',
          }}
        >
          <h2>Permission Error</h2>
          <p>Sorry - your user permissions do not allow access to this page.</p>
        </div>));

    const resource = this.props.resources.users;
    const maybeTerm = this.state.searchTerm ? ` for "${this.state.searchTerm}"` : '';
    const maybeSpelling = this.state.searchTerm ? 'spelling and ' : '';
    return (
      <Paneset>
        <SRStatus ref={(ref) => { this.SRStatus = ref; }} />
        {/* Filter Pane */}
        <Pane id="pane-filter" defaultWidth="16%" header={searchHeader}>
          <FilterGroups config={filterConfig} filters={this.state.filters} onChangeFilter={this.onChangeFilter} />
        </Pane>
        {/* Results Pane */}
        <Pane
          id="pane-results"
          defaultWidth="fill"
          paneTitle={
            <div style={{ textAlign: 'center' }}>
              <strong>Users</strong>
              <div>
                <em>{resource && resource.hasLoaded ? resource.other.totalRecords : ''} Result{users.length === 1 ? '' : 's'} Found</em>
              </div>
            </div>
          }
          lastMenu={newUserButton}
        >
          <MultiColumnList
            id="list-users"
            contentData={users}
            selectedRow={this.state.selectedItem}
            rowMetadata={['id', 'username']}
            formatter={resultsFormatter}
            onRowClick={this.onSelectRow}
            onHeaderClick={this.onSort}
            onNeedMoreData={this.onNeedMore}
            visibleColumns={['Active', 'Name', 'Barcode', 'Patron Group', 'User ID', 'Email']}
            sortOrder={this.state.sortOrder.replace(/^-/, '').replace(/,.*/, '')}
            sortDirection={this.state.sortOrder.startsWith('-') ? 'descending' : 'ascending'}
            isEmptyMessage={`No results found${maybeTerm}. Please check your ${maybeSpelling}filters.`}
            columnMapping={{ 'User ID': 'username' }}
            loading={resource ? resource.isPending : false}
            autosize
            virtualize
            ariaLabel={'User search results'}
            rowFormatter={this.anchoredRowFormatter}
            containerRef={(ref) => { this.resultsList = ref; }}
          />
        </Pane>

        {detailsPane}

        

        <Layer isOpen={data.addUserMode ? data.addUserMode.mode : false} label="Add New User Dialog">
          <UserForm
            id="userform-adduser"
            initialValues={{ active: true, personal: { preferredContactTypeId: '002' } }}
            addressTypes={data.addressTypes}
            onSubmit={(record) => { this.create(record); }}
            onCancel={this.onClickCloseNewUser}
            okapi={this.okapi}
            optionLists={{ patronGroups: this.props.data.patronGroups, contactTypes }}
          />
        </Layer>
        {this.state.showNotesPane && 
          <Notes onToggle={this.toggleNotes}/>
        }
      </Paneset>
    );
  }
}

export default Users;
