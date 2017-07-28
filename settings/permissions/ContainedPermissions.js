import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import RenderPermissions from '../../lib/RenderPermissions';

class ContainedPermissions extends React.Component {
  static propTypes = {
    resources: PropTypes.shape({
      availablePermissions: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
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
      availablePermissions={_.get(this.props.resources, ['availablePermissions', 'records'])}
      listedPermissions={this.props.selectedSet.subPermissions}
    />);
  }
}

export default ContainedPermissions;
