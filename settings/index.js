import _ from 'lodash';
// We have to remove node_modules/react to avoid having multiple copies loaded.
// eslint-disable-next-line import/no-unresolved
import React from 'react';
import Settings from '@folio/stripes-components/lib/Settings';

import PermissionSets from './permissions/PermissionSets';
import PatronGroupsSettings from './patrongroups/PatronGroupsSettings';

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

export default props => <Settings {...props} pages={_.sortBy(pages, ['label'])} />;
