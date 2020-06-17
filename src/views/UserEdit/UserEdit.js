import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import uuid from 'uuid';
import { FormattedMessage } from 'react-intl';

import {
  cloneDeep,
  find,
  omit,
  differenceBy,
  get,
} from 'lodash';

import { LoadingView } from '@folio/stripes/components';

import { eachPromise, getRecordObject } from '../../components/util';

import UserForm from './UserForm';
import { toUserAddresses, getFormAddressList } from '../../components/data/converters/address';
import contactTypes from '../../components/data/static/contactTypes';
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
    location: PropTypes.object,
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
      active: true,
      personal: {
        addresses: [],
        preferredContactTypeId: (find(contactTypes, { 'name': 'email' }) || {}).id,
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

    if (!userFormValues.personal) {
      userFormValues.personal = {};
    }

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
      'servicePoints',
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

  create = ({ requestPreferences, ...userFormData }) => {
    const { mutator, history, location: { search } } = this.props;
    const userData = cloneDeep(userFormData);
    const user = { ...userData, id: uuid() };
    user.personal.addresses = toUserAddresses(user.personal.addresses);

    mutator.records.POST(user)
      .then(() => {
        this.createRequestPreferences(requestPreferences, user.id);
        return mutator.perms.POST({ userId: user.id, permissions: [] });
      })
      .then(() => {
        history.push(`/users/preview/${user.id}${search}`);
      });
  }

  formatCustomFieldsPayload(customFields) {
    const copiedCustomFields = { ...customFields };

    Object.keys(copiedCustomFields).forEach(customFieldId => {
      if (!copiedCustomFields[customFieldId]) {
        delete copiedCustomFields[customFieldId];
      }
    });

    return copiedCustomFields;
  }

  update({ requestPreferences, ...userFormData }) {
    const {
      updateProxies,
      updateSponsors,
      updateServicePoints,
      mutator,
      history,
      resources,
      match: { params },
      location: {
        state,
        search,
      },
      stripes,
    } = this.props;

    const user = cloneDeep(userFormData);
    const prevUser = resources?.selUser?.records?.[0] ?? {};

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
    const curActive = user.active;
    const prevActive = prevUser.active;

    const formattedCustomFieldsPayload = this.formatCustomFieldsPayload(data.customFields);

    data.customFields = formattedCustomFieldsPayload;

    // if active has been changed manually on the form
    // or if the expirationDate has been removed
    if (curActive !== prevActive || !user.expirationDate) {
      data.active = curActive;
    } else {
      data.active = (moment(user.expirationDate).endOf('day').isSameOrAfter(today));
    }

    mutator.selUser.PUT(data).then(() => {
      history.push({
        pathname: params.id ? `/users/preview/${params.id}` : '/users',
        search,
        state,
      });
    });
  }

  async updatePermissions(perms) {
    const mutator = this.props.mutator.permissions;
    const prevPerms = (this.props.resources.permissions || {}).records || [];
    const removedPerms = differenceBy(prevPerms, perms, 'id');
    const addedPerms = differenceBy(perms, prevPerms, 'id');

    await eachPromise(removedPerms, mutator.DELETE);
    await eachPromise(addedPerms, mutator.POST);
  }

  render() {
    const {
      history,
      resources,
      location,
      match: { params },
    } = this.props;

    if (!resourcesLoaded(resources, ['uniquenessValidator'])) {
      return (
        <LoadingView
          data-test-form-page
          paneTitle={params.id ?
            <FormattedMessage id="ui-users.crud.editUser" /> :
            <FormattedMessage id="ui-users.crud.createUser" />
          }
          defaultWidth="100%"
        />
      );
    }

    // data is information that the form needs, mostly to populate options lists
    const formData = this.getUserFormData();
    const onSubmit = params.id ? (record) => this.update(record) : (record) => this.create(record);

    return (
      <UserForm
        formData={formData}
        initialValues={this.getUserFormValues()} // values are strictly values...if we're editing (id param present) pull in existing values.
        onSubmit={onSubmit}
        onCancel={() => {
          history.push({
            pathname: params.id ? `/users/preview/${params.id}` : '/users',
            state: location.state,
          });
        }}
        uniquenessValidator={this.props.mutator.uniquenessValidator}
        match={this.props.match}
        location={location}
        history={history}
      />
    );
  }
}

export default UserEdit;
