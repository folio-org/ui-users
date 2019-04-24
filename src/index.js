import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
// import Route from 'react-router-dom/Route';
import { Route } from '@folio/stripes/core';
import Switch from 'react-router-dom/Switch';
import { hot } from 'react-hot-loader';
import Users from './Users';
import * as Routes from './routes';

import Settings from './settings';
import { CommandList } from './components/Commander';
import commands from './commands';

class UsersRouting extends React.Component {
  static actionNames = ['stripesHome', 'usersSortByName'];

  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    showSettings: PropTypes.bool,
  }

  constructor(props) {
    super(props);
    this.connectedApp = props.stripes.connect(Users);
  }

  noMatch() {
    const {
      location: { pathname },
    } = this.props;

    return (
      <div>
        <h2>
          <FormattedMessage id="ui-users.errors.noMatch.oops" />
        </h2>
        <p>
          <FormattedMessage
            id="ui-users.errors.noMatch.how"
            values={{ location: <tt>{pathname}</tt> }}
          />
        </p>
      </div>
    );
  }

  render() {
    const {
      showSettings,
      match: { path },
    } = this.props;

    const basePath = '/users';

    if (showSettings) {
      return <Settings {...this.props} />;
    }

    return (
      <CommandList commands={commands}>
        <Switch>
          {/* <Route
            path={path}
            render={() => <this.connectedApp {...this.props} />}
          /> */}
          <Route path={basePath} component={Routes.UserSearchContainer}>
            <Route path={`${basePath}/view/:id`} component={Routes.UserViewContainer} />
          </Route>
          <Route path={`${basePath}/:id/edit`} component={Routes.UserEditContainer} />
          <Route render={this.noMatch} />
        </Switch>
      </CommandList>
    );
  }
}

export default hot(module)(UsersRouting);
