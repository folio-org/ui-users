import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import fetch from 'isomorphic-fetch';

import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import Button from '@folio/stripes-components/lib/Button';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import FilterPaneSearch from '@folio/stripes-components/lib/FilterPaneSearch';
import Layer from '@folio/stripes-components/lib/Layer';
import FilterGroups, { initialFilterState, onChangeFilter as commonChangeFilter, filters2cql } from '@folio/stripes-components/lib/FilterGroups';
import SRStatus from '@folio/stripes-components/lib/SRStatus';

import transitionToParams from '@folio/stripes-components/util/transitionToParams';
import makeQueryFunction from '@folio/stripes-components/util/makeQueryFunction';
import { stripesShape } from '@folio/stripes-core/src/Stripes';
import SearchAndSort from './lib/SearchAndSort';
import packageInfo from './package';

const INITIAL_RESULT_COUNT = 30;
const RESULT_COUNT_INCREMENT = 30;

const filterConfig = [
  {
    label: 'Status',
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
    stripes: stripesShape.isRequired,
    resources: PropTypes.shape({
      patronGroups: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      search: PropTypes.string,
    }).isRequired,
    mutator: PropTypes.shape({}).isRequired,
    okapi: PropTypes.shape({}).isRequired,
    onSelectRow: PropTypes.func,
  };

  static manifest = Object.freeze({
    userCount: { initialValue: INITIAL_RESULT_COUNT },
    query: {
      initialValue: {
        search: "",
        filters: "active.Active",
        sort: "Name"
      },
    },
    users: {
      type: 'okapi',
      records: 'users',
      recordsRequired: '%{userCount}',
      perRequest: 30,
      path: 'users',
      GET: {
        params: {
          query: (...args) => {
             /* 
              This code is not DRY as it is copied from makeQueryFunction in stripes-components.
              This is necessary, as makeQueryFunction only referneces query paramaters as a data source.
              STRIPES-480 is intended to correct this and allow this query function to be replace with a call
              to makeQueryFunction.
              https://issues.folio.org/browse/STRIPES-480  
            */ 
            const resourceData = args[2];
            const sortMap = {
              Active: 'active',
              Name: 'personal.lastName personal.firstName',
              'Patron Group': 'patronGroup.group',
              Username: 'username',
              Barcode: 'barcode',
              Email: 'personal.email',
            }

            let cql = `(username="${resourceData.query.search}*" or personal.firstName="${resourceData.query.search}*" or personal.lastName="${resourceData.query.search}*" or personal.email="${resourceData.query.search}*" or barcode="${resourceData.query.search}*" or id="${resourceData.query.search}*" or externalSystemId="${resourceData.query.search}*")`;

            const filterCql = filters2cql(filterConfig, resourceData.query.filters);
            if (filterCql) {
              if (cql) {
                cql = `(${cql}) and ${filterCql}`;
              } else {
                cql = filterCql;
              }
            }

            let { sort } = resourceData.query;
            if (sort) {
              const sortIndexes = sort.split(',').map((sort1) => {
                let reverse = false;
                if (sort1.startsWith('-')) {
                  sort1 = sort1.substr(1);
                  reverse = true;
                }
                let sortIndex = sortMap[sort1] || sort1;
                if (reverse) {
                  sortIndex = sortIndex.replace(' ', '/sort.descending ') + '/sort.descending';
                }
                return sortIndex;
              });
        
              cql += ` sortby ${sortIndexes.join(' ')}`;
            }
            return cql;
          },
        },
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
    this.connectedSearchAndSort = props.stripes.connect(SearchAndSort);
  }

  componentWillUpdate() {
    const pg = (this.props.resources.patronGroups || {}).records || [];
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
    this.props.mutator.query.update({search: ""});
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
    const queryCopy = Object.assign({}, this.props.resources.query);
    queryCopy.sort = sortOrder;
    this.props.mutator.query.replace(queryCopy);
  }

  onSelectRow = this.props.onSelectRow ? this.props.onSelectRow : (e, meta) => {
    const userId = meta.id;
    this.log('action', `clicked ${userId}, selected user =`, meta);
    this.setState({ selectedItem: meta });
    this.props.history.push(`/users/view/${userId}${this.props.location.search}`);
  }

  onClickAddNewUser = (e) => {
    if (e) e.preventDefault();
    this.log('action', 'clicked "add new user"');
    this.transitionToParams({ layer: 'create' });
  }

  onClickCloseNewUser = (e) => {
    if (e) e.preventDefault();
    this.log('action', 'clicked "close new user"');
    removeQueryParam('layer', this.props.location, this.props.history);
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
    this.props.mutator.userCount.replace(this.props.resources.userCount + RESULT_COUNT_INCREMENT);
  }

  getRowURL(rowData) {
    return `/users/view/${rowData.id}${this.props.location.search}`;
  }

  performSearch = _.debounce((query) => {
    this.log('action', `searched for '${query}'`);
    this.props.mutator.query.update({search: query});
  }, 350);

  updateFilters = (filters) => { // provided for onChangeFilter
    const queryCopy = Object.assign({}, this.props.resources.query);
    queryCopy.filters = Object.keys(filters).filter(key => filters[key]).join(',');
    this.props.mutator.query.replace(queryCopy);
  }

  create = (userdata) => {
    if (userdata.personal.addresses) {
      const addressTypes = (this.props.resources.addressTypes || {}).records || [];
      userdata.personal.addresses = toUserAddresses(userdata.personal.addresses, addressTypes); // eslint-disable-line no-param-reassign
    }
    const creds = Object.assign({}, userdata.creds, { username: userdata.username });
    const user = Object.assign({}, userdata, { id: uuid() });
    if (user.creds) delete user.creds;

    this.postUser(user)
    .then(newUser => this.postCreds(newUser.id, creds))
    .then(userId => this.postPerms(userId))
    .then((userId) => {
      this.onClickCloseNewUser();
      this.onSelectRow(null, { id: userId });
    });
  }

  postUser = user =>
    fetch(`${this.okapi.url}/users`, {
      method: 'POST',
      headers: Object.assign({}, { 'X-Okapi-Tenant': this.okapi.tenant, 'X-Okapi-Token': this.okapi.token, 'Content-Type': 'application/json' }),
      body: JSON.stringify(user),
    }).then((userPostResponse) => {
      if (userPostResponse.status >= 400) {
        throw new SubmissionError('Creating new user failed');
      } else {
        return userPostResponse.json();
      }
    }).then(userJson => userJson);

  postCreds = (userId, creds) => {
    this.log('xhr', `POST credentials for new user '${userId}':`, creds);
    const localCreds = Object.assign({}, creds, creds.password ? {} : { password: '' }, { userId });
    return fetch(`${this.okapi.url}/authn/credentials`, {
      method: 'POST',
      headers: Object.assign({}, { 'X-Okapi-Tenant': this.okapi.tenant, 'X-Okapi-Token': this.okapi.token, 'Content-Type': 'application/json' }),
      body: JSON.stringify(localCreds),
    }).then((credsPostResponse) => {
      if (credsPostResponse.status >= 400) {
        throw new SubmissionError('Creating credentials for new user failed');
      } else {
        return userId;
      }
    });
  }

  postPerms = (userId) => {
    const permissions = [];
    this.log('xhr', `POST permissions for new user '${userId}':`, permissions);
    return fetch(`${this.okapi.url}/perms/users`, {
      method: 'POST',
      headers: Object.assign({}, { 'X-Okapi-Tenant': this.okapi.tenant, 'X-Okapi-Token': this.okapi.token, 'Content-Type': 'application/json' }),
      body: JSON.stringify({ userId, permissions }),
    }).then((response) => {
      if (response.status >= 400) {
        throw new SubmissionError('Creating empty permissions for new user failed');
      } else {
        return userId;
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
    const props = this.props;
    const urlQuery = queryString.parse(props.location.search || '');
    const initialPath = (_.get(packageInfo, ['stripes', 'home']) ||
                         _.get(packageInfo, ['stripes', 'route']));

    return (<this.connectedSearchAndSort
      stripes={props.stripes}
      okapi={this.props.okapi}
      initialPath={initialPath}
      filterConfig={filterConfig}
      initialResultCount={INITIAL_RESULT_COUNT}
      resultCountIncrement={RESULT_COUNT_INCREMENT}
      parentResources={props.resources}
      parentMutator={this.props.mutator}
      onSelectRow={this.props.onSelectRow}
      path={this.props.location.pathname}
      urlQuery={urlQuery}
    />);
  }
}

export default Users;
