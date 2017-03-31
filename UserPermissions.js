import _ from 'lodash';
// We have to remove node_modules/react to avoid having multiple copies loaded.
// eslint-disable-next-line import/no-unresolved
import React, { PropTypes } from 'react';
import RenderPermissions from './lib/RenderPermissions';

const propTypes = {
  stripes: PropTypes.shape({
    hasPerm: PropTypes.func.isRequired,
  }).isRequired,
  data: PropTypes.shape({
    userPermissions: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  availablePermissions: PropTypes.arrayOf(PropTypes.object),
  mutator: PropTypes.shape({
    userPermissions: PropTypes.shape({
      POST: PropTypes.func.isRequired,
      DELETE: PropTypes.func.isRequired,
    }),
  }),
  viewUserProps: PropTypes.shape({
  }),
};

class UserPermissions extends React.Component {
  static manifest = Object.freeze({
    userPermissions: {
      type: 'okapi',
      records: 'permissionNames',
      DELETE: {
        pk: 'permissionName',
        path: 'perms/users/:{username}/permissions',
      },
      GET: {
        path: 'perms/users/:{username}/permissions?full=true',
      },
      path: 'perms/users/:{username}/permissions',
    },
  });

  constructor(props) {
    super(props);
    this.state = {
      addPermissionOpen: false,
      searchTerm: '',
      // handling active Permissions in state for presentation purposes only.
    };

    this.onToggleAddPermDD = this.onToggleAddPermDD.bind(this);
    this.addPermission = this.addPermission.bind(this);
    this.removePermission = this.removePermission.bind(this);
    this.onChangeSearch = this.onChangeSearch.bind(this);
    this.isPermAvailable = this.isPermAvailable.bind(this);
  }

  onToggleAddPermDD() {
    const isOpen = this.state.addPermissionOpen;
    this.setState({
      addPermissionOpen: !isOpen,
    });
  }

  onChangeSearch(e) {
    const searchTerm = e.target.value;
    this.setState({ searchTerm });
  }

  addPermission(perm) {
    this.props.mutator.userPermissions.POST(perm, this.props.viewUserProps).then(() => {
      this.onToggleAddPermDD();
    });
  }

  removePermission(perm) {
    console.log(this.props);
    this.props.mutator.userPermissions.DELETE(perm, this.props.viewUserProps, perm.permissionName);
  }

  isPermAvailable(perm) {
    const permInUse = _.some(this.props.data.userPermissions, perm);

    // This should be replaced with proper search when possible.
    const nameToCompare = !perm.displayName ? perm.permissionName.toLowerCase() : perm.displayName.toLowerCase();
    const permNotFiltered = _.includes(nameToCompare, this.state.searchTerm.toLowerCase());

    return !permInUse && permNotFiltered;
  }

  render() {

    const { userPermissions } = this.props.data;

    return (<RenderPermissions 
              {...this.props}
              heading="User permissions" 
              isPermAvailable={this.isPermAvailable} 
              addPermission={this.addPermission} 
              onChangeSearch={this.onChangeSearch} 
              removePermission={this.removePermission} 
              state={this.state} 
              onToggleAddPermDD={this.onToggleAddPermDD}
              userPermissions={userPermissions}
           ></RenderPermissions>);
      
  }
}

UserPermissions.propTypes = propTypes;

export default UserPermissions;
