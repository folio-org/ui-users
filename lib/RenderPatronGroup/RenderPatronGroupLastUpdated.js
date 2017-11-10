import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-flexbox-grid';

export class RenderPatronGroupLastUpdated extends React.Component {
  static propTypes = {
    mutator: PropTypes.shape({
      createdBy: PropTypes.shape({
        GET: PropTypes.func
      }),
      updatedBy: PropTypes.shape({
        GET: PropTypes.func
      }),
    }).isRequired
  };

  static defaultProps = {

  };

  static manifest = Object.freeze({
    createdBy: {
      type: 'okapi',
      path: 'users',
      GET: {
        path: 'users/!{item.metadata.createdByUserId}',
      },
    },
    updatedBy: {
      type: 'okapi',
      path: 'users',
      GET: {
        path: 'users/!{item.metadata.updatedByUserId}',
      },
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

  render() {
    let value;
    if(this.props.resources.updatedBy && this.props.resources.updatedBy.hasLoaded && this.props.item.metadata) {
      if(this.props.resources.updatedBy.records[0].id === this.props.item.metadata.updatedByUserId) {
        let date = new Date(this.props.item.metadata.updatedDate);
        value = this.formatDate(date) + " by " +
          this.props.resources.updatedBy.records[0].personal.lastName + ", " +
          this.props.resources.updatedBy.records[0].personal.firstName;
      }
    }
    return (
      <Col key={this.props.key} xs>{value}</Col>
    );
  }
}
