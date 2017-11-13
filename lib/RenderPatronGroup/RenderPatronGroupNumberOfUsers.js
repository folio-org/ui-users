import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-flexbox-grid';

export class RenderPatronGroupNumberOfUsers extends React.Component {

  static manifest = Object.freeze({
    users: {
      type: 'okapi',
      path: 'users?limit=0&facets=patronGroup&query=(patronGroup=!{item.id})',
    },
  });

  constructor(props) {
    super(props);
    this.state = {};
  }

  ready() {
    return this.props.resources.users && this.props.resources.users.hasLoaded;
  }

  getNumberOfPatrons() {
    return this.ready() ? this.props.resources.users.records[0].totalRecords : undefined;
  }

  render() {
    return (<Col key={this.props.key} xs>{this.getNumberOfPatrons()}</Col>);
  }

}
