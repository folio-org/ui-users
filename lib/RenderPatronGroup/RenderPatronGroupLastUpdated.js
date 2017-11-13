import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-flexbox-grid';

export class RenderPatronGroupLastUpdated extends React.Component {
  static propTypes = {
    mutator: PropTypes.shape({
      createdBy: PropTypes.shape({
        GET: PropTypes.func,
      }),
      updatedBy: PropTypes.shape({
        GET: PropTypes.func,
      }),
    }).isRequired,
  };

  static defaultProps = {};

  static manifest = Object.freeze({
    createdBy: {
      type: 'okapi',
      path: 'users/!{item.metadata.createdByUserId}',
    },
    updatedBy: {
      type: 'okapi',
      path: 'users/!{item.metadata.updatedByUserId}',
    }
  });

  constructor(props) {
    super(props);
    this.state = {};
  }

  formatDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    return [year, month < 10 ? "0" + month : month, day < 10 ? "0" + day : day].join("-")
  }

  buildValue(user, group) {
    let date = new Date(group.metadata.updatedDate);
    return this.formatDate(date) + " by " +
      user.personal.lastName + ", " +
      user.personal.firstName;
  }

  render() {
    let value;
    if(this.props.resources.updatedBy && this.props.resources.updatedBy.hasLoaded && this.props.item.metadata) {
      value = this.buildValue(this.props.resources.updatedBy.records[0], this.props.item);
    }
    return (
      <Col key={this.props.key} xs>{value}</Col>
    );
  }
}
