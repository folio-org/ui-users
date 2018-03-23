import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import ControlledVocab from '@folio/stripes-smart-components/lib/ControlledVocab';

import { RenderPatronGroupNumberOfUsers } from '../lib/RenderPatronGroup';

class PatronGroupsSettings extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
      intl: PropTypes.object.isRequired,
    }).isRequired,
    resources: PropTypes.shape({
      usersPerGroup: PropTypes.object,
    }).isRequired,
  };

  static manifest = Object.freeze({
    usersPerGroup: {
      type: 'okapi',
      records: 'users',
      path: 'users?limit=0&facets=patronGroup',
    },
  });

  constructor(props) {
    super(props);
    this.connectedControlledVocab = props.stripes.connect(ControlledVocab);
  }

  render() {
    const formatter = {
      numberOfObjects: item => (<RenderPatronGroupNumberOfUsers
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
