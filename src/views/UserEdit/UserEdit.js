import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import uuid from 'uuid';

import { cloneDeep, omit, differenceBy, get } from 'lodash';

import { eachPromise, getRecordObject } from '../../components/util';

import UserForm from './UserForm';
import ViewLoading from '../../components/Loading/ViewLoading';
import { toUserAddresses, getFormAddressList } from '../../components/data/converters/address';
import { deliveryFulfillmentValues } from '../../constants';

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
    getUserServicePoints: PropTypes.func,
    getPreferredServicePoint: PropTypes.func,
    mutator: PropTypes.object,
    getProxies: PropTypes.func,
    getSponsors: PropTypes.func,
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
      getProxies,
      getSponsors,
      getPreferredServicePoint,
      getUserServicePoints,
      resources,
      match,
    } = this.props;

    const initialFormValues = {
      personal: {
        addresses: [],
      },
      requestPreferences: {
        holdShelf: true,
        delivery: false,
        defaultServicePointId: null,
        defaultDeliveryAddressTypeId: null,
      }
    };

    if (!match.params.id) return initialFormValues;

    const user = this.getUser();
    const userFormValues = cloneDeep(user);
    const formRecordValues = getRecordObject(
      resources,
      'permissions',
    );

    userFormValues.personal.addresses = getFormAddressList(get(user, 'personal.addresses', []));

    return {
      ...userFormValues,
      ...formRecordValues,
      preferredServicePoint: getPreferredServicePoint(),
      proxies: getProxies(),
      sponsors: getSponsors(),
      servicePoints: getUserServicePoints(),
      requestPreferences: {
        ...initialFormValues.requestPreferences,
        ...get(this.props.resources, 'requestPreferences.records[0].requestPreferences[0]', {})
      },
    };
  }

  getUserFormData() {
    const {
      resources,
    } = this.props;
    const formData = getRecordObject(
      resources,
      'patronGroups',
      'addressTypes',
    );

    return formData;
  }

  createRequestPreferences = (requestPreferencesData, userId) => {
    const { mutator } = this.props;
    const payload = {
      userId,
      fulfillment: deliveryFulfillmentValues.HOLD_SHELF,
      ...requestPreferencesData,
    };

    mutator.requestPreferences.POST(payload);
  }

  updateRequestPreferences = (requestPreferences) => {
    const {
      match,
      mutator,
    } = this.props;

    const payload = {
      userId: match.params.id,
      holdShelf: true,
      fulfillment: deliveryFulfillmentValues.HOLD_SHELF,
      ...requestPreferences,
    };

    mutator.requestPreferences.PUT(payload);
  }

  create = ({ requestPreferences, creds, ...userFormData }) => {
    const { mutator, history } = this.props;
    const userData = cloneDeep(userFormData);
    const credentialsAreSet = userData.username;
    const user = { ...userData, id: uuid() };
    user.personal.addresses = toUserAddresses(user.personal.addresses);

    if (credentialsAreSet) {
      const credentials = {
        password: '',
        ...creds,
        username: userData.username,
      };

      mutator.records.POST(user)
        .then(() => mutator.creds.POST(Object.assign(credentials, { userId: user.id })))
        .then(() => {
          this.createRequestPreferences(requestPreferences, user.id);
          return mutator.perms.POST({ userId: user.id, permissions: [] });
        })
        .then(() => {
          history.push(`/users/preview/${user.id}`);
        });
    } else {
      mutator.records.POST(user)
        .then(() => {
          this.createRequestPreferences(requestPreferences, user.id);
          return mutator.perms.POST({ userId: user.id, permissions: [] });
        })
        .then(() => {
          history.push(`/users/preview/${user.id}`);
        });
    }
  }

  update({ requestPreferences, ...userFormData }) {
    const {
      updateProxies,
      updateSponsors,
      updateServicePoints,
      mutator,
      history,
      resources,
      stripes,
    } = this.props;

    const user = cloneDeep(userFormData);

    if (get(resources, 'requestPreferences.records[0].totalRecords')) {
      this.updateRequestPreferences(requestPreferences);
    } else {
      this.createRequestPreferences(requestPreferences, user.id);
    }

    user.personal.addresses = toUserAddresses(user.personal.addresses); // eslint-disable-line no-param-reassign

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
      return <ViewLoading data-test-form-page paneTitle={params.id ? 'Edit User' : 'Create User'} defaultWidth="100%" />;
    }

    // data is information that the form needs, mostly to populate options lists
    const formData = this.getUserFormData();

    const onSubmit = params.id ? (record) => this.update(record) : (record) => this.create(record);

    return (
      <UserForm
        formData={formData}
        initialValues={this.getUserFormValues()} // values are strictly values...if we're editing (id param present) pull in existing values.
        onSubmit={onSubmit}
        onCancel={() => history.goBack()}
        uniquenessValidator={this.props.mutator.uniquenessValidator}
      />
    );
  }
}

export default UserEdit;
