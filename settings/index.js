// We have to remove node_modules/react to avoid having multiple copies loaded.
// eslint-disable-next-line import/no-unresolved
import React from 'react';
import Settings from './Settings';

import PermissionSets from './PermissionSets';
import PatronGroupsSettings from './PatronGroupsSettings';

const pages = [
  {
    route: 'perms',
    label: 'Permission sets',
    component: PermissionSets,
    perm: 'perms.permissions.get',
  },
  {
    route: 'groups',
    label: 'Patron groups',
    component: PatronGroupsSettings,
    // No perm needed yet
  },
];

export default props => <Settings {...props} pages={pages} />;
