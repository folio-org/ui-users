import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { Accordion } from '@folio/stripes-components/lib/Accordion';
import Badge from '@folio/stripes-components/lib/Badge';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import List from '@folio/stripes-components/lib/List';

class UserServicePoints extends React.Component {
  static manifest = {
    servicePoints: {
      type: 'okapi',
      path: 'service-points',
      records: 'servicepoints',
    },
    servicePointsUsers: {
      type: 'okapi',
      path: 'service-points-users?query=(userId==:{id})',
      records: 'servicePointsUsers',
    },
  };

  static propTypes = {
    accordionId: PropTypes.string.isRequired,
    expanded: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
    resources: PropTypes.shape({
      servicePoints: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }).isRequired,
      servicePointsUsers: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }).isRequired,
    }).isRequired,
    stripes: PropTypes.shape({
      intl: PropTypes.object.isRequired,
    }).isRequired,
  };

  state = {
    userServicePoints: [],
  }

  static getDerivedStateFromProps(props, state) {
    const userServicePointsIds = get(props.resources.servicePointsUsers, ['records', 0, 'servicePointsIds'], []);
    const servicePoints = get(props.resources.servicePoints, ['records'], []);

    // New user service points have been received and the list of all service points has also been received.
    if ((userServicePointsIds.length !== state.userServicePoints.length) && servicePoints.length) {
      const userServicePoints = servicePoints
        .filter(sp => userServicePointsIds.includes(sp.id))
        .sort(((a, b) => a.localeCompare(b, undefined, { numeric: true })));

      return { userServicePoints };
    }

    return null;
  }

  renderServicePointPreference() {
    const servicePoints = get(this.props.resources.servicePoints, ['records'], []);
    const userDefaultServicePointId = get(this.props.resources.servicePointsUsers, ['records', 0, 'defaultServicePointId']);
    if (!userDefaultServicePointId || !servicePoints) return null;

    const userDefaultServicePoint = servicePoints.find(sp => sp.id === userDefaultServicePointId);
    if (!userDefaultServicePoint) return null;

    return (
      <KeyValue
        label={this.props.stripes.intl.formatMessage({ id: 'ui-users.sp.servicePointPreference' })}
        value={userDefaultServicePoint.name}
      />
    );
  }

  renderServicePoint = (sp) => {
    return (
      <li key={sp.id}>{sp.name}</li>
    );
  }

  renderServicePoints() {
    return (
      <List
        items={this.state.userServicePoints}
        itemFormatter={this.renderServicePoint}
        isEmptyMessage={this.props.stripes.intl.formatMessage({ id: 'ui-users.sp.noServicePoints' })}
      />
    );
  }

  render() {
    return (
      <Accordion
        displayWhenClosed={<Badge>{this.state.userServicePoints.length}</Badge>}
        id={this.props.accordionId}
        label={this.props.stripes.intl.formatMessage({ id: 'ui-users.sp.servicePoints' })}
        onToggle={this.props.onToggle}
        open={this.props.expanded}
      >
        {this.renderServicePointPreference()}
        {this.renderServicePoints()}
      </Accordion>
    );
  }
}

export default UserServicePoints;
