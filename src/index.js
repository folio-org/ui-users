import React from 'react';
import PropTypes from 'prop-types';
import Route from 'react-router-dom/Route';
import Switch from 'react-router-dom/Switch';
import { hot } from 'react-hot-loader';
import Users from './Users';
import Settings from './settings';
import { CommandList } from './components/Commander';
import commands from './keyboardCommands';

class UsersRouting extends React.Component {
  static actionNames = ['stripesHome', 'usersSortByName'];

  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
      intl: PropTypes.object.isRequired,
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
        <h2>{this.props.stripes.intl.formatMessage({ id: 'ui-users.errors.noMatch.oops' })}</h2>
        <p>{this.props.stripes.intl.formatMessage({ id: 'ui-users.errors.noMatch.how' }, { location: <tt>{this.props.location.pathname}</tt> })}</p>
      </div>
    );
  }

  render() {
    if (this.props.showSettings) {
      return <Settings {...this.props} />;
    }

    return (
      <CommandList commands={commands}>
        <Switch>
          <Route
            path={`${this.props.match.path}`}
            render={() => <this.connectedApp {...this.props} />}
          />
          <Route component={() => { this.NoMatch(); }} />
        </Switch>
      </CommandList>
    );
  }
}

export default hot(module)(UsersRouting);
