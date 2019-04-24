import React from 'react';
import cloneDeep from 'lodash/cloneDeep';

import Userform from './UserForm';

class UserEdit extends React.Component {
  static propTypes = {
    stripes: propTypes.object,
  }

  getUserFormData(user, addresses, sponsors, proxies, permissions, servicePoints, preferredServicePoint) {
    const userFormData = user ? cloneDeep(user) : user;
    userFormData.personal.addresses = addresses;
    Object.assign(userFormData, {
      sponsors,
      proxies,
      permissions,
      servicePoints,
      preferredServicePoint,
    });

    return userFormData;
  }

  update(user) {
    const addressTypes = (this.props.parentResources.addressTypes || {}).records || [];

    if (user.personal.addresses) {
      user.personal.addresses = toUserAddresses(user.personal.addresses, addressTypes); // eslint-disable-line no-param-reassign
    }

    const { proxies, sponsors, permissions, servicePoints, preferredServicePoint } = user;

    if (this.props.stripes.hasPerm('proxiesfor.item.put,proxiesfor.item.post')) {
      if (proxies) this.props.updateProxies(proxies);
      if (sponsors) this.props.updateSponsors(sponsors);
    }

    if (permissions) {
      this.updatePermissions(permissions);
    }

    if (servicePoints && this.props.stripes.hasPerm('inventory-storage.service-points-users.item.post,inventory-storage.service-points-users.item.put')) {
      this.props.updateServicePoints(servicePoints, preferredServicePoint);
    }

    const data = omit(user, ['creds', 'proxies', 'sponsors', 'permissions', 'servicePoints', 'preferredServicePoint']);
    const today = moment().endOf('day');

    data.active = (moment(user.expirationDate).endOf('day').isSameOrAfter(today));

    this.props.mutator.selUser.PUT(data).then(() => {
      this.setState({
        lastUpdate: new Date().toISOString(),
      });
      this.props.onCloseEdit();
    });
  }

  updatePermissions(perms) {
    const mutator = this.props.mutator.permissions;
    const prevPerms = (this.props.resources.permissions || {}).records || [];
    const removedPerms = differenceBy(prevPerms, perms, 'id');
    const addedPerms = differenceBy(perms, prevPerms, 'id');
    eachPromise(addedPerms, mutator.POST);
    eachPromise(removedPerms, mutator.DELETE);
  }

  render() {
    const { history, location } = this.props;

    const userFormData = this.getUserFormData(user, addresses, sponsors, proxies, permissions, servicePoints, preferredServicePoint);
    return (
      <UserForm
        {...this.props}
        initialValues={userFormData}
        onSubmit={record => this.update(record)}
        onCancel={() => { history.push(location.state.launched) }}
      />
    );
  }

}

export default UserEdit;
