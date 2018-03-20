import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import EditablePermissions from '../../lib/EditablePermissions';

class ContainedPermissions extends React.Component {
  static propTypes = {
    resources: PropTypes.shape({
      availablePermissions: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,
  };

  static manifest = Object.freeze({
    availablePermissions: {
      type: 'okapi',
      records: 'permissions',
      path: 'perms/permissions?length=1000&query=(mutable==false)',
    },
  });

  render() {
    return (<EditablePermissions
      {...this.props}
      heading="Assigned permissions"
      name="subPermissions"
      availablePermissions={_.get(this.props.resources, ['availablePermissions', 'records'])}
    />);
  }
}

export default ContainedPermissions;
