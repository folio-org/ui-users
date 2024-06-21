import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { FormattedMessage } from 'react-intl';

import {
  chunk,
  cloneDeep,
  find,
  omit,
  get,
  compact,
} from 'lodash';

import { LoadingView } from '@folio/stripes/components';
import {
  CalloutContext,
  withOkapiKy,
} from '@folio/stripes/core';

import { getRecordObject } from '../../components/util';

import UserForm from './UserForm';
import { toUserAddresses, getFormAddressList } from '../../components/data/converters/address';
import contactTypes from '../../components/data/static/contactTypes';
import {
  OKAPI_TENANT_HEADER,
  USER_FIELDS_TO_CHECK,
  deliveryFulfillmentValues,
} from '../../constants';
import { resourcesLoaded, showErrorCallout } from './UserEditHelpers';
import { preferredEmailCommunicationOptions } from '../../components/EditSections/EditContactInfo/constants';

class UserEdit extends React.Component {
  static propTypes = {
    stripes: PropTypes.object,
    resources: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    match: PropTypes.object,
    okapiKy: PropTypes.func.isRequired,
    updateProxies: PropTypes.func,
    updateSponsors: PropTypes.func,
    updateServicePoints: PropTypes.func,
    getUserServicePoints: PropTypes.func,
    getPreferredServicePoint: PropTypes.func,
    mutator: PropTypes.object,
    getProxies: PropTypes.func,
    getSponsors: PropTypes.func,
  }

  static contextType = CalloutContext;

  getUser() {
    const { resources, match: { params: { id } } } = this.props;
    const selUser = (resources.selUser || {}).records || [];

    if (selUser.length === 0 || !id) return null;
    // Logging below shows this DOES sometimes find the wrong record. But why?
    // console.log(`getUser: found ${selUser.length} users, id '${selUser[0].id}' ${selUser[0].id === id ? '==' : '!='} '${id}'`);
    return selUser.find(u => u.id === id);
  }

  getPrefEmailCommunicationFormValue(prefEmailComm) {
    return prefEmailComm?.every(item => typeof item === 'string') ?
      prefEmailComm?.map(a => {
        return preferredEmailCommunicationOptions.find(b => b.value === a);
      }) : prefEmailComm;
  }

  getUserFormValues() {
    const {
      getProxies,
      getSponsors,
      getPreferredServicePoint,
      getUserServicePoints,
      match,
    } = this.props;

    const initialFormValues = {
      active: true,
      personal: {
        addresses: [],
        firstName: '',
        preferredContactTypeId: (find(contactTypes, { 'name': 'email' }) || {}).id,
      },
      requestPreferences: {
        holdShelf: true,
        delivery: false,
        defaultServicePointId: null,
        defaultDeliveryAddressTypeId: null,
      },
      username: '',
      type: '',
      preferredEmailCommunication: [],
    };

    if (!match.params.id) return initialFormValues;

    const user = this.getUser();
    const userFormValues = cloneDeep(user);

    if (!userFormValues.personal) {
      userFormValues.personal = {};
    }

    userFormValues.personal.addresses = getFormAddressList(get(user, 'personal.addresses', []));
    userFormValues.preferredEmailCommunication = this.getPrefEmailCommunicationFormValue(userFormValues.preferredEmailCommunication);

    return {
      ...userFormValues,
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
      'departments',
      'userReadingRoomPermissions'
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

    mutator.requestPreferences
      .PUT(payload)
      .catch((e) => showErrorCallout(e, this.context.sendCallout));
  }

  deleteEmptyFields = (user) => {
    USER_FIELDS_TO_CHECK.forEach((field) => {
      const [property, nestedProperty] = field.split('.');
      const fieldProperty = nestedProperty ? user[property][nestedProperty] : user[property];

      if (!fieldProperty?.trim()) {
        if (nestedProperty) {
          delete user[property][nestedProperty];
        } else {
          delete user[property];
        }
      }
    });
  };

  formatPrefEmailCommPayload(prefEmailComm) {
    return prefEmailComm?.map(
      (EmailComm) => EmailComm.value
    );
  }

  create = ({ requestPreferences, ...userFormData }) => {
    const { mutator, history, location: { search } } = this.props;
    const userData = cloneDeep(userFormData);
    const user = { ...userData, id: uuidv4() };
    user.personal.addresses = toUserAddresses(user.personal.addresses);
    user.personal.email = user.personal.email.trim();
    user.departments = compact(user.departments);
    user.preferredEmailCommunication = this.formatPrefEmailCommPayload(user.preferredEmailCommunication);
    this.deleteEmptyFields(user);

    mutator.records.POST(user)
      .then(() => {
        this.createRequestPreferences(requestPreferences, user.id);
        return mutator.perms.POST({ userId: user.id, permissions: [] });
      })
      .then(() => {
        history.push(`/users/preview/${user.id}${search}`);
      }).catch((e) => showErrorCallout(e, this.context.sendCallout));
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

  updateUserReadingRoomAccess(list) {
    const { mutator } = this.props;
    const payload = list.filter(Boolean);

    mutator.userReadingRoomPermissions.PUT(payload);
  }

  update({ requestPreferences, readingRoomsAccessList, ...userFormData }) {
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

    // update user reading room access
    if (get(resources, 'userReadingRoomPermissions') && readingRoomsAccessList?.length) {
      this.updateUserReadingRoomAccess(readingRoomsAccessList);
    }

    if (get(resources, 'requestPreferences.records[0].totalRecords')) {
      this.updateRequestPreferences(requestPreferences);
    } else {
      this.createRequestPreferences(requestPreferences, user.id);
    }

    this.deleteEmptyFields(user);
    user.personal.addresses = toUserAddresses(user.personal.addresses); // eslint-disable-line no-param-reassign
    user.personal.email = user.personal.email?.trim();
    user.departments = compact(user.departments);
    user.preferredEmailCommunication = this.formatPrefEmailCommPayload(user.preferredEmailCommunication);

    const { proxies, sponsors, permissions, servicePoints, preferredServicePoint } = user;

    if (stripes.hasPerm('proxiesfor.item.put,proxiesfor.item.post')) {
      updateProxies(proxies || []);
      updateSponsors(sponsors || []);
    }

    if (stripes.hasPerm('ui-users.editperms')) {
      this.updatePermissions(user.id, permissions);
    }

    if (stripes.hasPerm('inventory-storage.service-points-users.item.post,inventory-storage.service-points-users.item.put')) {
      updateServicePoints(servicePoints, preferredServicePoint);
    }

    const data = omit(user, ['creds', 'proxies', 'sponsors', 'permissions', 'servicePoints', 'preferredServicePoint', 'readingRoomsAccessList']);
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

    mutator.selUser
      .PUT(data).then(() => {
        history.push({
          pathname: params.id ? `/users/preview/${params.id}` : '/users',
          search,
          state,
        });
      })
      .catch((e) => showErrorCallout(e, this.context.sendCallout));
  }

  async updatePermissions(userId, permissionsMap = {}) {
    const CHUNK_SIZE = 5;

    const result = await chunk(Object.entries(permissionsMap), CHUNK_SIZE)
      .reduce(async (prevPromise, itemsChunk) => {
        const prev = await prevPromise;
        const curr = await Promise.all(itemsChunk.map(([tenant, permissions]) => (
          this.updateUserTenantPermissions(userId, permissions, tenant)
        )));

        return prev.concat(curr);
      }, Promise.resolve([]));

    return result;
  }

  updateUserTenantPermissions = async (userId, permissions, tenant) => {
    const { stripes } = this.props;

    // the perms parameter is an array of permission objects, but the permissions API
    // wants an array of permission names.
    const permissionNames = (permissions ?? []).map(p => p.permissionName);
    const isCurrentTenant = tenant === stripes.okapi.tenant;

    if (isCurrentTenant) return this.updateCurrentTenantPermissions(userId, permissionNames);

    const recordService = this.getTenantPermUserRecordService(tenant);
    const permUserRecord = await recordService.getByUserId(userId);

    if (permUserRecord) {
      return recordService.update({
        ...omit(permUserRecord, 'metadata'),
        permissions: permissionNames,
      }).catch((e) => showErrorCallout(e, this.context.sendCallout));
    } else {
      const record = await recordService.create({ userId });

      return recordService.update({
        ...omit(record, 'metadata'),
        permissions: permissionNames,
      }).catch((e) => showErrorCallout(e, this.context.sendCallout));
    }
  }

  getTenantPermUserRecordService = (tenant) => {
    const { okapiKy } = this.props;

    const ky = okapiKy.extend({
      hooks: {
        beforeRequest: [
          request => {
            request.headers.set(OKAPI_TENANT_HEADER, tenant);
          },
        ],
      }
    });

    const searchParams = {
      full: true,
      indexField: 'userId',
    };

    return {
      getByUserId: (userId) => ky.get(`perms/users/${userId}`, { searchParams }).json(),
      create: (json) => ky.post('perms/users', { json }).json(),
      update: (json) => ky.put(`perms/users/${json.id}`, { json }).json(),
    };
  }

  async updateCurrentTenantPermissions(userId, permissionNames) {
    const {
      permissions: permissionsMutator,
      perms: permUserMutator,
      permUserId,
    } = this.props.mutator;

    const { perms: permUserRecords } = this.props.resources;

    // If the user record has never had any associated permissions, a user permissions
    // record may not exist. The PUT operation will fail if that's the case; thus,
    // if no record is found, one has to be created before we assign the permissions
    // as the last step.
    if (permUserRecords.records.length === 1) {
      const record = permUserRecords.records[0];

      // N.B. permUserId is the id of the *permissions user* record, not the regular
      // user record!
      permUserId.replace(record.id);
      record.permissions = permissionNames;

      // Currently there is a bug (https://issues.folio.org/browse/MODPERMS-100) that
      // requires us to remove the metadata object before sending the request.
      delete record.metadata;

      permissionsMutator
        .PUT(record)
        .catch((e) => showErrorCallout(e, this.context.sendCallout));
    } else {
      // Create a new permissions user record first
      await permUserMutator.POST({ userId }).then(record => {
        record.permissions = permissionNames;
        permUserId.replace(record.id);
        permissionsMutator
          .PUT(record)
          .catch((e) => showErrorCallout(e, this.context.sendCallout));
      });
    }
  }

  render() {
    const {
      history,
      resources,
      location,
      match: { params },
    } = this.props;

    const profilePictureConfig = get(resources, 'settings.records[0]');

    if (!resourcesLoaded(resources, ['uniquenessValidator']) || (!this.getUser() && this.props.match.params.id)) {
      return (
        <LoadingView
          data-test-form-page
          paneTitle={params.id ?
            <FormattedMessage id="ui-users.edit" /> :
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
            search: location.search,
          });
        }}
        uniquenessValidator={this.props.mutator.uniquenessValidator}
        match={this.props.match}
        location={location}
        history={history}
        stripes={this.props.stripes}
        profilePictureConfig={profilePictureConfig}
      />
    );
  }
}

export default withOkapiKy(UserEdit);
