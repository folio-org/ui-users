import React from 'react';
import PropTypes from 'prop-types';
import RenderPermissions from '../../lib/RenderPermissions';

class PermissionSet extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      availablePermissions: PropTypes.arrayOf(PropTypes.object),
    }).isRequired,
    addPermission: PropTypes.func.isRequired,
    removePermission: PropTypes.func.isRequired,
    selectedSet: PropTypes.object.isRequired,
  };

  static manifest = Object.freeze({
    availablePermissions: {
      type: 'okapi',
      records: 'permissions',
      path: 'perms/permissions?length=1000&query=(mutable=false)',
    },
  });

  render() {
    return (<RenderPermissions
      {...this.props}
      heading="Contains"
      addPermission={this.props.addPermission}
      removePermission={this.props.removePermission}
      availablePermissions={this.props.data.availablePermissions}
      listedPermissions={this.props.selectedSet.subPermissions}
    />);
  }
}

export default PermissionSet;
