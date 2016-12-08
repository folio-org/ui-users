import React from 'react';
import Match from 'react-router/Match';
import Miss from 'react-router/Miss';
import Users from './Users';

class UsersRouting extends React.Component {
  constructor(props){
    super(props);
    this.connectedUsers = props.connect(Users);
  }

  NoMatch() {
    return <div>
      <h2>Uh-oh!</h2>
      <p>How did you get to <tt>{this.props.location.pathname}</tt>?</p>
    </div>
  }

  render() {
    var pathname = this.props.pathname;
    var connect = this.props.connect;
    console.log("matching location:", this.props.location.pathname);

    return <div>
      <Match pattern={`${pathname}`} component={this.connectedUsers}/>
      <Miss component={this.NoMatch.bind(this)}/>
    </div>
  }
}

export default UsersRouting;
