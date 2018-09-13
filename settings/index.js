import _ from 'lodash';
import React from 'react';
import Settings from '@folio/stripes-components/lib/Settings';

import PermissionSets from './permissions/PermissionSets';
import PatronGroupsSettings from './PatronGroupsSettings';
import AddressTypesSettings from './AddressTypesSettings';
import ProfilePictureSettings from './ProfilePictureSettings';
import OwnerSettings from './OwnerSettings';
import FeeFineSettings from './FeeFineSettings';
import WaiveSettings from './WaiveSettings';
import PaymentSettings from './PaymentSettings';
import CommentRequiredSettings from './CommentRequiredSettings';
import RefundReasonsSettings from './RefundReasonsSettings';

const general = [
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
  {
    route: 'profilepictures',
    label: 'Profile pictures',
    component: ProfilePictureSettings,
  },
];

const feefines = [
  {
    route: 'owners',
    label: 'Owners',
    component: OwnerSettings,
    perm: 'ui-users.settings.owners',
  },
  {
    route: 'feefinestable',
    label: 'Manual charges',
    component: FeeFineSettings,
    perm: 'ui-users.settings.feefines',
  },
  {
    route: 'waivereasons',
    label: 'Waive reasons',
    component: WaiveSettings,
    perm: 'ui-users.settings.waives',
  },
  {
    route: 'payments',
    label: 'Payment methods',
    component: PaymentSettings,
    perm: 'ui-users.settings.payments',
  },
  {
    route: 'refunds',
    label: 'Refund reasons',
    component: RefundReasonsSettings,
    perm: 'ui-users.settings.refunds',
  },
  {
    route: 'comments',
    label: 'Comment required',
    perm: 'ui-users.settings.comments',
    component: CommentRequiredSettings,
  },
];

const sections = [
  {
    label: 'General',
    pages: _.sortBy(general, ['label']),
  },
  {
    label: 'Fee/fine',
    pages: _.sortBy(feefines, ['label']),
  },
];

export default props => <Settings {...props} sections={sections} paneTitle="Users" />;
