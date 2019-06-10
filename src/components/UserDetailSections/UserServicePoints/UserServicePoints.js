import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
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
    preferredServicePoint: PropTypes.string,
    servicePoints: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
    })),
  };

  renderServicePointPreference() {
    const {
      servicePoints,
      preferredServicePoint,
    } = this.props;
    if (!servicePoints || !servicePoints.length) return null;

    let servicePointPreference;
    if (preferredServicePoint === '-') {
      servicePointPreference = <FormattedMessage id="ui-users.sp.preferredSPNone" />;
    } else {
      if (!servicePoints) return null;
      const servicePoint = servicePoints.find(sp => sp.id === preferredServicePoint);
      if (!servicePoint) return null;
      servicePointPreference = servicePoint.name;
    }

    return (
      <KeyValue
        label={<FormattedMessage id="ui-users.sp.servicePointPreference" />}
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
    const { servicePoints } = this.props;

    return (
      <List
        items={servicePoints}
        itemFormatter={this.renderServicePoint}
        isEmptyMessage={<FormattedMessage id="ui-users.sp.noServicePoints" />}
      />
    );
  }

  render() {
    const {
      servicePoints,
      accordionId,
      onToggle,
      expanded,
    } = this.props;
    return (
      <Accordion
        displayWhenClosed={<Badge>{servicePoints.length}</Badge>}
        id={accordionId}
        label={<Headline size="large" tag="h3"><FormattedMessage id="ui-users.sp.servicePoints" /></Headline>}
        onToggle={onToggle}
        open={expanded}
      >
        {this.renderServicePointPreference()}
        {this.renderServicePoints()}
      </Accordion>
    );
  }
}

export default UserServicePoints;
