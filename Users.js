import _ from 'lodash'; // eslint-disable-line
import fetch from 'isomorphic-fetch'; // eslint-disable-line
import React, { PropTypes, Component } from 'react'; // eslint-disable-line
import Match from 'react-router/Match'; // eslint-disable-line
import {Row, Col} from 'react-bootstrap'; // eslint-disable-line

import Pane from '@folio/stripes-components/lib/Pane'; // eslint-disable-line
import Paneset from '@folio/stripes-components/lib/Paneset'; // eslint-disable-line
import PaneMenu from '@folio/stripes-components/lib/PaneMenu'; // eslint-disable-line
import Button from '@folio/stripes-components/lib/Button'; // eslint-disable-line
import Icon from '@folio/stripes-components/lib/Icon'; // eslint-disable-line
import Checkbox from '@folio/stripes-components/lib/Checkbox'; // eslint-disable-line
import TextField from '@folio/stripes-components/lib/TextField'; // eslint-disable-line
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList'; // eslint-disable-line
import KeyValue from '@folio/stripes-components/lib/KeyValue'; // eslint-disable-line
import FilterPaneSearch from '@folio/stripes-components/lib/FilterPaneSearch'; // eslint-disable-line
import FilterControlGroup from '@folio/stripes-components/lib/FilterControlGroup'; // eslint-disable-line
import Select from '@folio/stripes-components/lib/Select'; // eslint-disable-line
import Layer from '@folio/stripes-components/lib/Layer'; // eslint-disable-line

import UserForm from './UserForm';
import ViewUser from './ViewUser';

class Users extends Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
    store: PropTypes.object,
  };

  static propTypes = {
    data: PropTypes.object.isRequired,
    pathname: PropTypes.string.isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      query: PropTypes.object, // object of key=value pairs
      search: PropTypes.string, // string combining all parts of query
    }).isRequired,
    mutator: PropTypes.object,
  };

  static manifest = Object.freeze({
    addUserMode: { },
    users: {
      type: 'okapi',
      records: 'users',
      path: (queryParams, _pathComponents, _resourceValues) => {
        // console.log('Users manifest "users" path function, queryParams = ', queryParams);
        const { query, filterActive, filterInactive, sort } = queryParams || {};

        let cql;
        if (query) {
          cql = `username="${query}*" or personal.first_name="${query}*" or personal.last_name="${query}*"`;
        }

        let filterCql;
        if (filterActive && !filterInactive) {
          filterCql = 'active=true';
        } else if (filterInactive && !filterActive) {
          filterCql = 'active=false';
        } else if (!filterActive && !filterInactive) {
          // Technically, we should force this configuration to find
          // no records; but it probably makes more sense to do
          // nothing, and allow both active AND inactive records.
        }

        if (filterCql) {
          if (cql) {
            cql = `(${cql}) and ${filterCql}`;
          } else {
            cql = filterCql;
          }
        }

        if (sort) {
          const sortMap = {
            Active: 'active',
            Name: 'personal.last_name personal.first_name',
            Username: 'username',
            Email: 'personal.email',
          };
          const sortIndex = sortMap[sort];
          if (sortIndex) {
            if (cql === undefined) cql = 'username=*';
            cql += ` sortby ${sortIndex}`;
          }
        }

        let path = 'users';
        if (cql) path += `?query=${encodeURIComponent(cql)}`;

        console.log(`query=${query} active=${filterActive} inactive=${filterInactive} sort=${sort} -> ${path}`);
        return path;
      },
      staticFallback: { path: 'users' },
    },
  });

  constructor(props, context) {
    super(props);

    const query = props.location.query || {};
    this.state = {
      filter: {
        active: query.filterActive || false,
        inactive: query.filterInactive || false,
      },
      selectedItem: {},
      searchTerm: query.query || '',
      sortOrder: query.sort || '',
    };
    props.mutator.addUserMode.replace({ mode: false });

    this.okapi = context.store.getState().okapi;

    this.onClickAddNewUser = this.onClickAddNewUser.bind(this);
    this.onClickCloseNewUser = this.onClickCloseNewUser.bind(this);
    this.onChangeFilter = this.onChangeFilter.bind(this);
    // this.performSearch = _.debounce(this.performSearch.bind(this), 250);
    this.performSearch = this.performSearch.bind(this); // For now, prefer instant response
    this.onChangeSearch = this.onChangeSearch.bind(this);
    this.onClearSearch = this.onClearSearch.bind(this);
    this.onSort = this.onSort.bind(this);
    this.onSelectRow = this.onSelectRow.bind(this);
  }

  // search Handlers...
  onChangeFilter(e) {
    const filter = this.state.filter;
    filter[e.target.id] = !filter[e.target.id];
    console.log('onChangeFilter setting state', filter);
    this.setState({ filter });
    this.updateSearch(this.state.searchTerm, this.state.sortOrder, filter);
  }

  onClearSearch() {
    console.log('User cleared search');
    this.setState({ searchTerm: '' });
    this.context.router.transitionTo(this.props.location.pathname);
  }

  onSort(e, meta) {
    const sortOrder = meta.name;
    console.log('User sorted by', sortOrder);
    this.setState({ sortOrder });
    this.updateSearch(this.state.searchTerm, sortOrder, this.state.filter);
  }

  onSelectRow(e, meta) {
    const userId = meta.id;
    console.log('User clicked', userId, 'location = ', this.props.location);
    this.setState({ selectedItem: meta });
    this.context.router.transitionTo(`/users/view/${userId}${this.props.location.search}`);
  }

  // end search Handlers

  // AddUser Handlers
  onClickAddNewUser(e) {
    if (e) e.preventDefault();
    this.props.mutator.addUserMode.replace({ mode: true });
  }

  onClickCloseNewUser(e) {
    if (e) e.preventDefault();
    this.props.mutator.addUserMode.replace({ mode: false });
  }
  // end AddUser Handlers


  onChangeSearch(e) {
    const term = e.target.value;
    this.setState({ searchTerm: term });
    this.performSearch(term);
  }

  performSearch(term) {
    console.log('User searched:', term, 'at', this.props.location.pathname);
    const transitionPath = term === '' ? this.props.location.pathname : `${this.props.location.pathname}?query=${term}`;
    this.context.router.transitionTo(transitionPath);
  }


  // We need to explicitly pass changed values into this function,
  // as state-change only happens after event is handled.
  updateSearch(query, sortOrder, filter) {
    console.log(`updateSearch('${query}', '${sortOrder}',`, filter, ')');
    let transitionLoc = this.props.location.pathname;
    const params = {};
    if (query) params.query = query;
    if (sortOrder) params.sort = sortOrder;
    if (filter.active) params.filterActive = true;
    if (filter.inactive) params.filterInactive = true;
    const keys = Object.keys(params);
    if (keys.length) {
      // eslint-disable-next-line prefer-template
      transitionLoc += '?' + keys.map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');
    }
    this.context.router.transitionTo(transitionLoc);
  }

  create(data) {
    // extract creds object from user object
    const creds = Object.assign({}, data.creds, { username: data.username });
    if (data.creds) delete data.creds; // eslint-disable-line no-param-reassign
    // POST user record
    this.props.mutator.users.POST(data);
    // POST credentials, permission-user, permissions;
    this.postCreds(data.username, { credentials: creds });
    this.onClickCloseNewUser();
  }

  postCreds(username, creds) {
    fetch(`${this.okapi.url}/authn/users`, {
      method: 'POST',
      headers: Object.assign({}, { 'X-Okapi-Tenant': this.okapi.tenant, 'X-Okapi-Token': this.okapi.token }),
      body: JSON.stringify(creds),
    }).then((response) => {
      if (response.status >= 400) {
        console.log('Users. POST of creds failed.');
      } else {
        this.postPerms(username, 'users.super');
      }
    });
  }

  postPerms(username, perms) {
    fetch(`${this.okapi.url}/perms/users`, {
      method: 'POST',
      headers: Object.assign({}, { 'X-Okapi-Tenant': this.okapi.tenant, 'X-Okapi-Token': this.okapi.token }),
      body: username,
    }).then((response) => {
      if (response.status >= 400) {
        console.log('Users. POST of username failed.');
      } else {
        this.postUsersPerms(username, perms);
      }
    });
  }

  postUsersPerms(username, perm) {
    fetch(`${this.okapi.url}/perms/users/${username}/permissions`, {
      method: 'POST',
      headers: Object.assign({}, { 'X-Okapi-Tenant': this.okapi.tenant, 'X-Okapi-Token': this.okapi.token }),
      body: JSON.stringify({ permission_name: perm }),
    }).then((response) => {
      if (response.status >= 400) {
        console.log("Users. POST of user's perms failed.");
      } else {
        // nothing to do
      }
    });
  }

  render() {
    const { data, pathname } = this.props;
    const users = data.users || [];

    /* searchHeader is a 'custom pane header'*/
    const searchHeader = <FilterPaneSearch id="SearchField" onChange={this.onChangeSearch} onClear={this.onClearSearch} value={this.state.searchTerm} />;
    const resultMenu = <PaneMenu><button><Icon icon="bookmark" /></button></PaneMenu>;
    const fineHistory = [{ 'Due Date': '11/12/2014', 'Amount': '34.23', 'Status': 'Unpaid' }]; // eslint-disable-line

    const resultsFormatter = {
      Active: user => user.active,
      Name: user => `${_.get(user, ['personal', 'last_name'], '')}, ${_.get(user, ['personal', 'first_name'], '')}`,
      Username: user => user.username,
      Email: user => _.get(user, ['personal', 'email']),
    };

    return (
      <Paneset>
        {/* Filter Pane */}
        <Pane defaultWidth="16%" header={searchHeader}>
          <FilterControlGroup label="Filters">
            <Checkbox
              id="active"
              label="Active"
              checked={this.state.filter.active}
              onChange={this.onChangeFilter}
              marginBottom0
              hover
              fullWidth
              checkedIcon={<Icon icon="eye" />}
            />
            <Checkbox
              id="inactive"
              label="Inactive"
              checked={this.state.filter.inactive}
              onChange={this.onChangeFilter}
              marginBottom0
              hover
              fullWidth
              checkedIcon={<Icon icon="eye" />}
            />
          </FilterControlGroup>
          <FilterControlGroup label="Actions">
            <Button fullWidth onClick={this.onClickAddNewUser}>New user</Button>
          </FilterControlGroup>
        </Pane>
        {/* Results Pane */}
        <Pane
          defaultWidth="40%"
          paneTitle={
            <div style={{ textAlign: 'center' }}>
              <strong>Results</strong>
              <div>
                <em>{users.length} Result{users.length === 1 ? '' : 's'} Found</em>
              </div>
            </div>
          }
          lastMenu={resultMenu}
        >
          <MultiColumnList
            contentData={users}
            selectedRow={this.state.selectedItem}
            rowMetadata={['id']}
            formatter={resultsFormatter}
            onRowClick={this.onSelectRow}
            onHeaderClick={this.onSort}
            visibleColumns={['Active', 'Name', 'Username', 'Email']}
            fullWidth
            sortOrder={this.state.sortOrder}
            isEmptyMessage={`No results found for "${this.state.searchTerm}". Please check your spelling and filters.`}
          />
        </Pane>

        {/* Details Pane */}
        <Match pattern={`${pathname}/view/:userid`} render={props => <ViewUser placeholder={'placeholder'} {...props} />} />
        <Layer isOpen={data.addUserMode ? data.addUserMode.mode : false} label="Add New User Dialog">
          <UserForm
            onSubmit={(record) => { this.create(record); }}
            onCancel={this.onClickCloseNewUser}
          />
        </Layer>
      </Paneset>
    );
  }
}

export default Users;
