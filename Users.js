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
    params: PropTypes.object,
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
      path: 'users?query=[{"field":"\'username\'","value":"?{query}","op":"="}]',
      staticFallback: { path: 'users' },
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      // Search/Filter state
      patronFilter: true,
      employeeFilter: false,
      searchTerm: '',
      addUserMode: false,
    };

    this.onClickAddNewUser = this.onClickAddNewUser.bind(this);
    this.onClickCloseNewUser = this.onClickCloseNewUser.bind(this);
    this.onChangeFilter = this.onChangeFilter.bind(this);
    this.onChangeSearch = this.onChangeSearch.bind(this);
    this.onClearSearch = this.onClearSearch.bind(this);
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

    const term = e.target.value;
    const transitionLoc = term === "" ?  this.props.location.pathname : `${this.props.location.pathname}?query=${term}`;     

    console.log('User searched:', term, 'at', this.props.location.pathname);
    this.setState({ searchTerm: term });
    this.context.router.transitionTo(transitionLoc);

  }

  onClearSearch() {
    console.log('User cleared search');
    this.setState({ searchTerm: '' });
    this.context.router.transitionTo(this.props.location.pathname);
  }

  onClickItemHandler(userId) {
    console.log('User clicked', userId, 'location = ', this.props.location);
    this.context.router.transitionTo(`/users/view/${userId}${this.props.location.search}`);
  }

  // end search Handlers

  // AddUser Handlers
  onClickAddNewUser() {
    console.log('add Clicked');
    this.setState({
      addUserMode: true,
    });
  }

  onClickCloseNewUser() {
    this.setState({
      addUserMode: false,
    });
  }
  // end AddUser Handlers
  create(data) {
    this.props.mutator.user.POST(data);
  }

  render() {
    const { data, params, pathname } = this.props;
    if (!data.users) return <div />;
    const resultMenu = <PaneMenu><button><Icon icon="bookmark" /></button></PaneMenu>;
    const fineHistory = [{ 'Due Date': '11/12/2014', 'Amount': '34.23', 'Status': 'Unpaid' }]; // eslint-disable-line 
    const displayUsers = data.users.reduce((results, user) => {
      results.push({
        id: user.id,
        Name: user.personal.full_name,
        Username: user.username,
        Email: user.personal.email_primary,
      });
      return results;
    }, []);

    /* searchHeader is a 'custom pane header'*/
    const searchHeader = <FilterPaneSearch id="SearchField" onChange={this.onChangeSearch} onClear={this.onClearSearch} value={this.state.searchTerm} />;
    console.log(params);

    return (
      <Paneset>
        {/* Filter Pane */}
        <Pane defaultWidth="16%" header={searchHeader}>
          <FilterControlGroup label="Filters">
            <Checkbox
              id="patronFilter"
              label="Patrons"
              checked={this.state.patronFilter}
              onChange={this.onChangeFilter}
              marginBottom0
              hover
              fullWidth
            />
            <Checkbox
              id="employeeFilter"
              label="Employees"
              checked={this.state.employeeFilter}
              onChange={this.onChangeFilter}
              marginBottom0 hover fullWidth
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
