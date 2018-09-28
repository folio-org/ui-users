import React from 'react';
import PropTypes from 'prop-types';
import { ControlledVocab } from '@folio/stripes/smart-components';

import PatronGroupNumberOfUsers from '../components/PatronGroupNumberOfUsers';

class PatronGroupsSettings extends React.Component {
  // adding the desired-count parameter, :50, to this query is an egregious
  // hack that willfully and knowingly abuses facets to contort them to
  // handle a reporting situation they were simply not designed for.
  // this may become inefficient with a large number of users; it will
  // certainly be non-functional with a large number (> 50) of groups.
  // FIXME details at https://issues.folio.org/projects/MODUSERS/issues/MODUSERS-57
  static manifest = Object.freeze({
    usersPerGroup: {
      type: 'okapi',
      records: 'users',
      path: 'users?limit=0&facets=patronGroup:50',
    },
  });

  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
      intl: PropTypes.object.isRequired,
    }).isRequired,
    resources: PropTypes.shape({
      usersPerGroup: PropTypes.object,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.connectedControlledVocab = props.stripes.connect(ControlledVocab);
  }

  render() {
    const formatter = {
      numberOfObjects: item => (<PatronGroupNumberOfUsers
        item={item}
        usersPerGroup={this.props.resources ? this.props.resources.usersPerGroup : null}
      />),
    };

    return (
      <this.connectedControlledVocab
        {...this.props}
        // We have to unset the dataKey to prevent the props.resources in
        // <ControlledVocab> from being overwritten by the props.resources here.
        dataKey={undefined}
        baseUrl="groups"
        records="usergroups"
        label={this.props.stripes.intl.formatMessage({ id: 'ui-users.information.patronGroups' })}
        labelSingular={this.props.stripes.intl.formatMessage({ id: 'ui-users.information.patronGroup' })}
        objectLabel={this.props.stripes.intl.formatMessage({ id: 'ui-users.information.patronGroup.users' })}
        visibleFields={['group', 'desc']}
        columnMapping={{
          group: this.props.stripes.intl.formatMessage({ id: 'ui-users.information.patronGroup' }),
          desc: this.props.stripes.intl.formatMessage({ id: 'ui-users.description' }),
        }}
        formatter={formatter}
        nameKey="group"
        id="patrongroups"
      />
    );
  }
}

export default PatronGroupsSettings;
