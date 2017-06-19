// We have to remove node_modules/react to avoid having multiple copies loaded.
// eslint-disable-next-line import/no-unresolved
import React, { Component, PropTypes } from 'react';
import Route from 'react-router-dom/Route';
import Switch from 'react-router-dom/Switch';
import Users from './Users';
import Settings from './settings';

class UsersRouting extends Component {
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

  NoMatch() {
    return (
      <div>
        <h2>Uh-oh!</h2>
        <p>How did you get to <tt>{this.props.location.pathname}</tt>?</p>
      </div>
    );
  }

  render() {
    if (this.props.showSettings) {
      return <Settings {...this.props} />;
    }

    return (
      <Switch>
        <Route
          path={`${this.props.match.path}`}
          render={() => <this.connectedApp {...this.props} />}
        />
        <Route component={() => { this.NoMatch(); }} />
      </Switch>
    );
  }
}

export default UsersRouting;
