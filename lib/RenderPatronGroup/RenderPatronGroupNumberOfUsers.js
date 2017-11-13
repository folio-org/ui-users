import React from 'react';
import { Col } from 'react-flexbox-grid';

export class RenderPatronGroupNumberOfUsers extends React.Component {

  static manifest = Object.freeze({
    users: {
      type: 'okapi',
      path: 'users',
      accumulate: 'true',
      fetch: false,
    },
  });

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if(this.props.item.id) {
      this.fetchUsers(this.props.item);
    }
  }

  fetchUsers(group) {
    this.props.mutator.users.GET({
      params: {
        limit: 0,
        facets: 'patronGroup',
        query: `(patronGroup=${group.id})`
      }
    });
  }

  getNumberOfPatrons() {
    let value = 0;
    if(this.ready()) {
      for(let user of this.props.resources.users.records) {
        if(user.resultInfo.facets.length > 0) {
          const facetValue = user.resultInfo.facets[0].facetValues[0];
          if(facetValue.value === this.props.item.id) {
            value = facetValue.count;
          }
        }
      }
    }
    return value;
  }

  ready() {
    return this.props.resources.users;
  }

  render() {
    return (<Col key={this.props.key} xs>{this.getNumberOfPatrons()}</Col>);
  }

}
