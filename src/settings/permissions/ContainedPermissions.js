import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import EditablePermissions from '../../components/EditablePermissions';

class ContainedPermissions extends React.Component {
  static manifest = Object.freeze({
    availablePermissions: {
      type: 'okapi',
      records: 'permissions',
      path: 'perms/permissions?length=1000&query=(mutable==false)',
    },
  });

  static propTypes = {
    resources: PropTypes.shape({
      availablePermissions: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,
  };

  render() {
    return (<EditablePermissions
      {...this.props}
      heading={<FormattedMessage id="ui-users.permissions.assignedPermissions" />}
      name="subPermissions"
      availablePermissions={_.get(this.props.resources, ['availablePermissions', 'records'])}
    />);
  }
}

export default ContainedPermissions;
