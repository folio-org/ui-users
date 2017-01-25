import _ from 'lodash';
import React, { Component, PropTypes } from 'react'; // eslint-disable-line
import Match from 'react-router/Match'; // eslint-disable-line
import {Row, Col} from 'react-bootstrap'; // eslint-disable-line

/* shared stripes components */
import Pane from '@folio/stripes-components/lib/Pane'; // eslint-disable-line
import Paneset from '@folio/stripes-components/lib/Paneset'; // eslint-disable-line
import PaneMenu from '@folio/stripes-components/lib/PaneMenu'; // eslint-disable-line
import Button from '@folio/stripes-components/lib/Button'; // eslint-disable-line
import Icon from '@folio/stripes-components/lib/Icon'; // eslint-disable-line
import MultiColumnListUsers from './lib/MultiColumnList'; // eslint-disable-line 
import KeyValue from '@folio/stripes-components/lib/KeyValue'; // eslint-disable-line
import TextField from '@folio/stripes-components/lib/TextField'; // eslint-disable-line
import Checkbox from '@folio/stripes-components/lib/Checkbox'; // eslint-disable-line
import FilterPaneSearch from '@folio/stripes-components/lib/FilterPaneSearch'; // eslint-disable-line
import FilterControlGroup from '@folio/stripes-components/lib/FilterControlGroup'; // eslint-disable-line
import Select from '@folio/stripes-components/lib/Select'; // eslint-disable-line
import Layer from '@folio/stripes-components/lib/Layer'; // eslint-disable-line

import UserForm from './UserForm';
import ViewUser from './ViewUser';

class Users extends Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }

  static propTypes = {
    data: PropTypes.object.isRequired,
    pathname: PropTypes.string.isRequired,
    location: PropTypes.object.isRequired,
    mutator: PropTypes.object,
  };

  static manifest = {
    searchResults: [],
    /* detail: {
      fineHistory:[]
    } */
    user: {
      type: 'okapi',
      path: 'users',
      fetch: false,
    },
    users: {
      type: 'okapi',
      records: 'users',
      path: 'users?query=(username="?{query:-}*" or personal.first_name="?{query:-}*" or personal.last_name="?{query:-}*") ?{sort:+sortby} ?{sort:-}',
      staticFallback: { path: 'users' },
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      // Search/Filter state
      activeFilter: true,
      inactiveFilter: false,
      searchTerm: '',
      sortOrder: '',
      addUserMode: false,
    };

    this.onClickAddNewUser = this.onClickAddNewUser.bind(this);
    this.onClickCloseNewUser = this.onClickCloseNewUser.bind(this);
    this.onChangeFilter = this.onChangeFilter.bind(this);
    this.onChangeSearch = this.onChangeSearch.bind(this);
    this.onClearSearch = this.onClearSearch.bind(this);
    this.onSortHandler = this.onSortHandler.bind(this);
    this.onClickItemHandler = this.onClickItemHandler.bind(this);
  }

  componentWillMount() {
    const resultData = [{ Name: 'Pete Sherman', Address: '391 W. Richardson St. Duarte, CA 91010', Fines: '$34.23' }];
    // const fineHistory = [{"Due Date": "11/12/2014", "Amount":"34.23", "Status":"Unpaid"}];
    this.props.mutator.searchResults.replace(resultData);
    // this.props.mutator.detail.replace({fineHistory: fineHistory});
  }

  // search Handlers...
  onChangeFilter(e) {
    const stateObj = {};
    stateObj[e.target.id] = !this.state[e.target.id];
    this.setState(stateObj);
  }

  onChangeSearch(e) {
    const query = e.target.value;
    console.log(`User searched for '${query}' at '${this.props.location.pathname}'`);

    this.setState({ searchTerm: query });
    this.updateSearchSort(query, this.state.sortOrder);
  }

  onClearSearch() {
    console.log('User cleared search');
    this.setState({ searchTerm: '' });
    this.context.router.transitionTo(this.props.location.pathname);
  }

  onSortHandler(heading) {
    const sortMap = {
      Name: 'personal.last_name personal.first_name',
      Username: 'username',
      Email: 'personal.email',
    };
    const sortOrder = sortMap[heading];
    console.log('User sorted by', sortOrder);
    this.setState({ sortOrder });
    this.updateSearchSort(this.state.searchTerm, sortOrder);
  }

  onClickItemHandler(userId) {
    console.log('User clicked', userId, 'location = ', this.props.location);
    this.context.router.transitionTo(`/users/view/${userId}${this.props.location.search}`);
  }

  // end search Handlers

  // AddUser Handlers
  onClickAddNewUser(e) {
    if (e) e.preventDefault();
    this.setState({
      addUserMode: true,
    });
  }

  onClickCloseNewUser(e) {
    if (e) e.preventDefault();
    this.setState({
      addUserMode: false,
    });
  }
  // end AddUser Handlers

  updateSearchSort(query, sortOrder) {
    console.log(`updateSearchSort('${query}', '${sortOrder}')`);
    let transitionLoc = this.props.location.pathname;
    // if (sortOrder && !query) query = "cql.allRecords=1";
    if (query) transitionLoc += `?query=${query}`;
    if (sortOrder) {
      transitionLoc += query ? '&' : '?';
      transitionLoc += `sort=${sortOrder}`;
    }
    this.context.router.transitionTo(transitionLoc);
  }

  create(data) {
    this.props.mutator.user.POST(data);
  }

  render() {
    const { data, pathname } = this.props;
    if (!data.users) return <div />;
    const resultMenu = <PaneMenu><button><Icon icon="bookmark" /></button></PaneMenu>;
    const fineHistory = [{ 'Due Date': '11/12/2014', 'Amount': '34.23', 'Status': 'Unpaid' }]; // eslint-disable-line 
    const displayUsers = data.users.reduce((results, user) => {
      results.push({
        id: user.id,
        Name: `${_.get(user, ['personal', 'last_name'], '')}, ${_.get(user, ['personal', 'first_name'], '')}`,
        Username: user.username,
        Email: _.get(user, ['personal', 'email']),
      });
      return results;
    }, []);

    /* searchHeader is a 'custom pane header'*/
    const searchHeader = <FilterPaneSearch id="SearchField" onChange={this.onChangeSearch} onClear={this.onClearSearch} value={this.state.searchTerm} />;

    return (
      <Paneset>
        {/* Filter Pane */}
        <Pane defaultWidth="16%" header={searchHeader}>
          <FilterControlGroup label="Filters">
            <Checkbox
              id="activeFilter"
              label="Active"
              checked={this.state.activeFilter}
              onChange={this.onChangeFilter}
              marginBottom0
              hover
              fullWidth
              checkedIcon={<Icon icon="eye" />}
            />
            <Checkbox
              id="inactiveFilter"
              label="Inactive"
              checked={this.state.inactiveFilter}
              onChange={this.onChangeFilter}
              marginBottom0
              hover
              fullWidth
              checkedIcon={<Icon icon="eye" />}
            />
          </FilterControlGroup>
          <FilterControlGroup label="Actions">
            <Button fullWidth onClick={this.onClickAddNewUser}>Add User</Button>
          </FilterControlGroup>
        </Pane>

        {/* Results Pane */}
        <Pane defaultWidth="32%" paneTitle="Results" lastMenu={resultMenu}>
          <MultiColumnListUsers
            contentData={displayUsers}
            onClickItemHandler={this.onClickItemHandler}
            onSortHandler={this.onSortHandler}
          />
        </Pane>

        {/* Details Pane */}
        <Match pattern={`${pathname}/view/:userid`} component={ViewUser} />
        <Layer isOpen={this.state.addUserMode} label="Add New User Dialog">
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
