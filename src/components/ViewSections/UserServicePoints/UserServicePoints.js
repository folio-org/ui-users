import React from 'react';
import PropTypes from 'prop-types';
import {
  Accordion,
  Badge,
  KeyValue,
  List,
  Headline
} from '@folio/stripes/components';

class UserServicePoints extends React.Component {
  static propTypes = {
    accordionId: PropTypes.string.isRequired,
    expanded: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
    stripes: PropTypes.shape({
      intl: PropTypes.object.isRequired,
    }).isRequired,
    preferredServicePoint: PropTypes.string,
    servicePoints: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
    })),
  };

  renderServicePointPreference() {
    const { servicePoints, preferredServicePoint } = this.props;
    if (!servicePoints || !servicePoints.length) return null;

    let servicePointPreference;
    if (preferredServicePoint === '-') {
      servicePointPreference = this.props.stripes.intl.formatMessage({ id: 'ui-users.sp.preferredSPNone' });
    } else {
      const servicePoint = servicePoints.find(sp => sp.id === preferredServicePoint);
      if (!servicePoint) return null;

      servicePointPreference = servicePoint.name;
    }

    return (
      <KeyValue
        label={this.props.stripes.intl.formatMessage({ id: 'ui-users.sp.servicePointPreference' })}
        value={servicePointPreference}
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
        items={this.props.servicePoints}
        itemFormatter={this.renderServicePoint}
        isEmptyMessage={this.props.stripes.intl.formatMessage({ id: 'ui-users.sp.noServicePoints' })}
      />
    );
  }

  render() {
    return (
      <Accordion
        displayWhenClosed={<Badge>{this.props.servicePoints.length}</Badge>}
        id={this.props.accordionId}
        label={<Headline size="large" tag="h3">{this.props.stripes.intl.formatMessage({ id: 'ui-users.sp.servicePoints' })}</Headline>}
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
