import _ from 'lodash';
import React from 'react';
import Settings from '@folio/stripes-components/lib/Settings';

import PermissionSets from './permissions/PermissionSets';
import PatronGroupsSettings from './PatronGroupsSettings';
import AddressTypesSettings from './AddressTypesSettings';

const pages = [
  {
    route: 'perms',
    label: 'Permission sets',
    component: PermissionSets,
    perm: 'ui-users.editpermsets',
  },
  {
    route: 'groups',
    label: 'Patron groups',
    component: PatronGroupsSettings,
    perm: 'ui-users.settings.usergroups',
  },

  {
    route: 'addresstypes',
    label: 'Address Types',
    component: AddressTypesSettings,
    perm: 'ui-users.settings.addresstypes',
  },
];

export default props => <Settings {...props} pages={_.sortBy(pages, ['label'])} paneTitle="Users" />;
