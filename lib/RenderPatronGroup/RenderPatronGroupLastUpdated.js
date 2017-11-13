import React from 'react';
import { Col } from 'react-flexbox-grid';

export class RenderPatronGroupLastUpdated extends React.Component {

  static manifest = Object.freeze({
    updatedBy: {
      type: 'okapi',
      path: 'users/!{item.metadata.updatedByUserId}',
    }
  });

  constructor(props) {
    super(props);
  }

  getLastUpdated() {
    return this.ready() ? this.buildValue(this.props.resources.updatedBy.records[0], this.props.item) : undefined;
  }

  ready() {
    return this.props.resources.updatedBy && this.props.resources.updatedBy.hasLoaded && this.props.item.metadata;
  }

  buildValue(user, group) {
    let date = new Date(group.metadata.updatedDate);
    return this.formatDate(date) + " by " + user.personal.lastName + ", " + user.personal.firstName;
  }

  formatDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    return [year, month < 10 ? "0" + month : month, day < 10 ? "0" + day : day].join("-")
  }

  render() {
    return (<Col key={this.props.key} xs>{this.getLastUpdated()}</Col>);
  }
}
