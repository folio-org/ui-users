// We have to remove node_modules/react to avoid having multiple copies loaded.
// eslint-disable-next-line import/no-unresolved
import React, { Component, PropTypes } from 'react';
import Match from 'react-router/Match';
import Miss from 'react-router/Miss';
import Users from './Users';

class UsersRouting extends Component {
  static propTypes = {
    connect: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    pathname: PropTypes.string,
  }

  constructor(props) {
    super(props);
    this.connectedApp = props.connect(Users);
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
    const { pathname } = this.props;
    return (
      <div>
        <Match
          pattern={`${pathname}`}
          component={this.connectedApp} />
        <Miss component={() => { this.NoMatch(); }} />
      </div>
    );
  }
}

export default UsersRouting;
