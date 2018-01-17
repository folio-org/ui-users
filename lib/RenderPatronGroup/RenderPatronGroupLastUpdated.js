import get from 'lodash/get';
import React from 'react';
import PropTypes from 'prop-types';

class RenderPatronGroupLastUpdated extends React.Component {

  static propTypes = {
    item: PropTypes.object.isRequired,
    users: PropTypes.object.isRequired,
    groups: PropTypes.object.isRequired,
    gloss: PropTypes.string.isRequired,
  };

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
    const groups = get(this.props.groups, 'records', []);
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
      const users = get(this.props.users, 'records', []);
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
    const { users, item } = this.props;
    return users && users.hasLoaded && item.id;
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
    return [year, month < 10 ? `0${month + 1}` : month + 1, day < 10 ? `0${day}` : day].join('-');
  }

  render() {
    const value = this.getLastUpdated();
    return (<div key={this.props.gloss} title={value}>{value}</div>);
  }
}

export default RenderPatronGroupLastUpdated;
