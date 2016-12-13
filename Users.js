import React, { PropTypes } from 'react';
import Match from 'react-router/Match';

/* shared stripes components */
import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import Button from '@folio/stripes-components/lib/Button';
import Icon from '@folio/stripes-components/lib/Icon';
import Checkbox from '@folio/stripes-components/lib/Checkbox';
import FilterPaneSearch from '@folio/stripes-components/lib/FilterPaneSearch';
import FilterControlGroup from '@folio/stripes-components/lib/FilterControlGroup';
import ViewUser from './ViewUser';
import MultiColumnListUsers from './lib/MultiColumnList';

class Users extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
  };

  static propTypes = {
    data: PropTypes.object.isRequired,
    params: PropTypes.object,
    pathname: PropTypes.string.isRequired,
    location: PropTypes.object.isRequired,
  };

  static manifest = {
    users: {
      type: 'okapi',
      records: 'users',
      path: 'users?query={"username":"?{query}"}',
      // And when we move to PostgreSQL: ?query=[{"field":"'username'","value":"knord","op":"="}]
      staticFallback: { path: 'users' },
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      // Search/Filter state...
      patronFilter: true,
      employeeFilter: false,
      searchTerm: '',
    };

    this.onChangeFilter = this.onChangeFilter.bind(this);
    this.onChangeSearch = this.onChangeSearch.bind(this);
    this.onClearSearch = this.onClearSearch.bind(this);
    this.onClickItemHandler = this.onClickItemHandler.bind(this);
  }

  onChangeFilter(e) {
    const stateObj = {};
    stateObj[e.target.id] = !this.state[e.target.id];
    this.setState(stateObj);
  }

  onChangeSearch(e) {
    const term = e.target.value;
    console.log('User searched:', term, 'at', this.props.location.pathname);
    this.setState({ searchTerm: term });
    this.context.router.transitionTo(`${this.props.location.pathname}?query=${term}`);
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

  render() {
    const { data, params, pathname } = this.props;
    if (!data.users) return <div />;
    const resultMenu = <PaneMenu><button><Icon icon="bookmark" /></button></PaneMenu>;
    const displayUsers = data.users.reduce((results, user) => {
      results.push({
        id: user.id,
        Name: user.personal.full_name,
        Username: user.username,
        Email: user.personal.email_primary });
      return results;
    }, []);

    /* searchHeader is a 'custom pane header' */
    const searchHeader = <FilterPaneSearch id="SearchField" onChange={this.onChangeSearch} onClear={this.onClearSearch} value={this.state.searchTerm} />;
    console.log(params);
    return (
      <Paneset>
        { /* Filter Pane */ }
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
            <Button fullWidth>Add User</Button>
          </FilterControlGroup>
        </Pane>

        { /* Results Pane */ }
        <Pane defaultWidth="32%" paneTitle="Results" lastMenu={resultMenu}>
          <MultiColumnListUsers
            contentData={displayUsers}
            onClickItemHandler={this.onClickItemHandler}
          />
        </Pane>

        { /* Details Pane */ }
        <Match pattern={`${pathname}/view/:userid`} component={ViewUser} />
      </Paneset>
    );
  }
}

export default Users;
