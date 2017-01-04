import React, { Component, PropTypes } from 'react'; // eslint-disable-line
import Match from 'react-router/Match'; // eslint-disable-line
import Miss from 'react-router/Miss'; // eslint-disable-line
import Users from './Users';

class UsersRouting extends Component {

  static propTypes = {
    connect: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    pathname: PropTypes.string,
  }

  constructor(props) {
    super(props);
    this.connectedUsers = props.connect(Users);
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
        <Match pattern={`${pathname}`} component={this.connectedUsers} />
        <Miss component={() => { this.NoMatch(); }} />
      </div>
    );
  }
}

export default UsersRouting;
