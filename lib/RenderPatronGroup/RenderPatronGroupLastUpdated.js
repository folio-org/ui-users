import React from 'react';
import PropTypes from 'prop-types';
import { Col } from 'react-flexbox-grid';

export class RenderPatronGroupLastUpdated extends React.Component {

  static propTypes = {
    item: PropTypes.object.isRequired,
    gloss: PropTypes.string.isRequired,
    additionalFields: PropTypes.object.isRequired,
  };

  static defaultProps = {};

  static manifest = Object.freeze({});

  constructor(props) {
    super(props);
  }

  getLastUpdated() {
    if (this.ready()) {
      let group = this.getGroup();
      let user = this.getUser(group);
      if (user) {
        return this.buildValue(user, group);
      }
    }
  }

  ready() {
    return this.props.additionalFields.lastUpdated && this.props.item.id;
  }

  getGroup() {
    const inheritedResources = this.props.additionalFields.lastUpdated.inheritedProps.resources;
    for (const group of inheritedResources.groups.records) {
      if (group.id === this.props.item.id) {
        return group;
      }
    }
  }

  getUser(group) {
    if (group && group.metadata) {
      const inheritedResources = this.props.additionalFields.lastUpdated.inheritedProps.resources;
      for (const user of inheritedResources.users.records) {
        if (user.id === group.metadata.updatedByUserId) {
          return user;
        }
      }
    }
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
    return (<Col key={this.props.gloss} xs>{this.getLastUpdated()}</Col>);
  }
}
