import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-flexbox-grid';

export class RenderPatronGroupNumberOfUsers extends React.Component {
  static propTypes = {
    mutator: PropTypes.shape({
      users: PropTypes.shape({
        GET: PropTypes.func,
      }),
    }).isRequired,
  };

  static defaultProps = {};

  static manifest = Object.freeze({
    patronGroup: {},
    users: {
      type: 'okapi',
      path: 'users?limit=0&facets=patronGroup&query=(patronGroup=!{item.id})',
    },
  });

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    let value;
    if(this.props.resources.users && this.props.resources.users.hasLoaded) {
      value = this.props.resources.users.records[0].totalRecords;
    }
    return (
      <Col key={this.props.key} xs>{value}</Col>
    );
  }

}
