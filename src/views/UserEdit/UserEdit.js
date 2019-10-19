import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import uuid from 'uuid';

import { cloneDeep, omit, differenceBy, get } from 'lodash';

import { eachPromise, getRecordObject } from '../../components/util';

import UserForm from './UserForm';
import ViewLoading from '../../components/Loading/ViewLoading';
import { toUserAddresses, toListAddresses } from '../../components/data/converters/address';

function resourcesLoaded(obj, exceptions = []) {
  for (const resource in obj) {
    if (!exceptions.includes(resource)) {
      if (Object.prototype.hasOwnProperty.call(obj, resource)) {
        if (obj[resource] === null) {
          return false;
        }
        if (typeof obj[resource] === 'object') {
          if (Object.prototype.hasOwnProperty.call(obj[resource], 'isPending')) {
            if (obj[resource].isPending) {
              return false;
            }
          }
        }
      }
    }
  }
  return true;
}

class UserEdit extends React.Component {
  static propTypes = {
    stripes: PropTypes.object,
    resources: PropTypes.object,
    history: PropTypes.object,
    match: PropTypes.object,
    updateProxies: PropTypes.func,
    updateSponsors: PropTypes.func,
    updateServicePoints: PropTypes.func,
    getPreferredServicePoint: PropTypes.func,
    mutator: PropTypes.object,
  }

  getUser() {
    const { resources, match: { params: { id } } } = this.props;
    const selUser = (resources.selUser || {}).records || [];

    if (selUser.length === 0 || !id) return null;
    // Logging below shows this DOES sometimes find the wrong record. But why?
    // console.log(`getUser: found ${selUser.length} users, id '${selUser[0].id}' ${selUser[0].id === id ? '==' : '!='} '${id}'`);
    return selUser.find(u => u.id === id);
  }

  getUserFormValues() {
    const {
      getPreferredServicePoint,
      resources
    } = this.props;

    const user = this.getUser();
    const userFormValues = cloneDeep(user);
    const formRecordValues = getRecordObject(
      resources,
      'sponsors',
      'proxies',
      'permissions',
      'servicePoints'
    );

    const addressTypes = resources.addressTypes.records;
    const addresses = toListAddresses(get(user, ['personal', 'addresses'], []), addressTypes);

    const preferredServicePoint = getPreferredServicePoint();
    userFormValues.personal.addresses = addresses;
    Object.assign(userFormValues, formRecordValues, {
      preferredServicePoint
    });

    return userFormValues;
  }

  getUserFormData() {
    const {
      resources
    } = this.props;
    const formData = getRecordObject(
      resources,
      'patronGroups',
      'addressTypes',
    );
    return formData;
  }

  create = (userdata) => {
    const { mutator, history } = this.props;
    if (userdata.username) {
      const creds = Object.assign({}, userdata.creds, { username: userdata.username }, userdata.creds.password ? {} : { password: '' });
      const user = Object.assign({}, userdata, { id: uuid() });
      if (user.creds) delete user.creds;

      mutator.records.POST(user)
        .then(newUser => mutator.creds.POST(Object.assign(creds, { userId: newUser.id })))
        .then(newCreds => mutator.perms.POST({ userId: newCreds.userId, permissions: [] }))
        .then((perms) => {
          history.push(`/users/preview/${perms.userId}`);
        });
    } else {
      const user = Object.assign({}, userdata, { id: uuid() });
      if (user.creds) delete user.creds;

      mutator.records.POST(user)
        .then((newUser) => mutator.perms.POST({ userId: newUser.id, permissions: [] }))
        .then((perms) => {
          history.push(`/users/preview/${perms.userId}`);
        });
    }
  }

  update(user) {
    const {
      updateProxies,
      updateSponsors,
      updateServicePoints,
      mutator,
      history,
      resources,
      stripes,
    } = this.props;

    const addressTypes = (resources.addressTypes || {}).records || [];

    if (user.personal.addresses) {
      user.personal.addresses = toUserAddresses(user.personal.addresses, addressTypes); // eslint-disable-line no-param-reassign
    }

    const { proxies, sponsors, permissions, servicePoints, preferredServicePoint } = user;

    if (stripes.hasPerm('proxiesfor.item.put,proxiesfor.item.post')) {
      if (proxies) updateProxies(proxies);
      if (sponsors) updateSponsors(sponsors);
    }

    if (permissions) {
      this.updatePermissions(permissions);
    }

    if (servicePoints && stripes.hasPerm('inventory-storage.service-points-users.item.post,inventory-storage.service-points-users.item.put')) {
      updateServicePoints(servicePoints, preferredServicePoint);
    }

    const data = omit(user, ['creds', 'proxies', 'sponsors', 'permissions', 'servicePoints', 'preferredServicePoint']);
    const today = moment().endOf('day');

    data.active = (moment(user.expirationDate).endOf('day').isSameOrAfter(today));

    mutator.selUser.PUT(data).then(() => {
      history.goBack();
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
    const {
      history,
      resources,
      match: { params }
    } = this.props;

    if (!resourcesLoaded(resources, ['uniquenessValidator'])) {
      return <ViewLoading data-test-form-page paneTitle={params.id ? 'Edit User' : 'Create User'} />;
    }

    // values are strictly values...if we're editing (id param present) pull in existing values.
    let formValues = { personal: {} };
    if (params.id) {
      formValues = this.getUserFormValues();
    }

    // data is information that the form needs, mostly to populate options lists
    const formData = this.getUserFormData();

    const onSubmit = params.id ? (record) => this.update(record) : (record) => this.create(record);

    return (
      <UserForm
        formData={formData}
        initialValues={formValues}
        onSubmit={onSubmit}
        onCancel={() => { history.goBack(); }}
        uniquenessValidator={this.props.mutator.uniquenessValidator}
      />
    );
  }
}

export default UserEdit;
