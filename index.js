import React from 'react';
import PropTypes from 'prop-types';
import Route from 'react-router-dom/Route';
import Switch from 'react-router-dom/Switch';
import queryString from 'query-string';
import { ApolloClient, ApolloProvider, createNetworkInterface, graphql, gql } from 'react-apollo';

import Users from './Users';
import Settings from './settings';

const networkInterface = createNetworkInterface({
  uri: 'http://localhost:3005/graphql'
});
const client = new ApolloClient({
  networkInterface: networkInterface
});
const UserQuery = gql`
  query UserQuery ($q: String) {
    users(cql: $q) {
      id
      username
      active
      barcode
      patronGroup
      personal {
        firstName
        lastName
        email
      }
    }
  }
`;

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
    this.connectedApp = props.stripes.connect(graphql(UserQuery, {
      options: ({ location }) => {
        const query = queryString.parse(location.search);
        if (query && query.query) {
          return { variables: { q: query.query } }; 
        }
        return {};
      }
    })(Users));
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
      <ApolloProvider client={client}>
        <Switch>
          <Route
            path={`${this.props.match.path}`}
            render={() => <this.connectedApp {...this.props} />}
          />
          <Route component={() => { this.NoMatch(); }} />
        </Switch>
      </ApolloProvider>
    );
  }
}

export default UsersRouting;
