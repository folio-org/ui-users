import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Col } from 'react-flexbox-grid';

class RenderPatronGroupLastUpdated extends React.Component {

  static propTypes = {
    item: PropTypes.object.isRequired,
    gloss: PropTypes.string.isRequired,
    additionalFields: PropTypes.object.isRequired,
  };

  static defaultProps = {};

  static manifest = Object.freeze({});

  constructor(props) {
    super(props);
    this.state = {};
  }

  getLastUpdated() {
    let value;
    if (this.ready()) {
      const group = this.getGroup();
      const user = this.getUser(group);
      if (user) {
        value = this.buildValue(user, group);
      }
    }
    return value;
  }

  getGroup() {
    const groups = _.get(this.props.additionalFields, 'lastUpdated.inheritedProps.resources.groups.records', []);
    let group;
    for (const g of groups) {
      if (g.id === this.props.item.id) {
        group = g;
        break;
      }
    }
    return group;
  }

  getUser(group) {
    let user;
    if (group && group.metadata) {
      const users = _.get(this.props.additionalFields, 'lastUpdated.inheritedProps.resources.users.records', []);
      for (const u of users) {
        if (u.id === group.metadata.updatedByUserId) {
          user = u;
          break;
        }
      }
    }
    return user;
  }

  ready() {
    return this.props.additionalFields.lastUpdated && this.props.item.id;
  }

  buildValue(user, group) {
    const date = new Date(group.metadata.updatedDate);
    return `${this.formatDate(date)} by ${user.personal.lastName}, ${user.personal.firstName}`;
  }

  // eslint-disable-next-line class-methods-use-this
  formatDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    return [year, month < 10 ? `0${month}` : month, day < 10 ? `0${day}` : day].join('-');
  }

  render() {
    return (<Col key={this.props.gloss} xs>{this.getLastUpdated()}</Col>);
  }
}

export default RenderPatronGroupLastUpdated;
