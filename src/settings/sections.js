import React from 'react';
import { FormattedMessage } from 'react-intl';
import { sortBy } from 'lodash';

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
import TransferAccountsSettings from './TransferAccountsSettings';
import CustomFieldsSettingsPane from './CustomFieldsSettings';
import ConditionsSettings from './ConditionsSettings';
import LimitsSettings from './LimitsSettings';
import DepartmentsSettings from './DepartmentsSettings';

const settingsGeneral = [
  {
    route: 'perms',
    label: <FormattedMessage id="ui-users.settings.permissionSet" />,
    component: PermissionSets,
    perm: 'ui-users.settings.permsets',
  },
  {
    route: 'groups',
    label: <FormattedMessage id="ui-users.settings.patronGroups" />,
    component: PatronGroupsSettings,
    perm: 'ui-users.settings.usergroups',
  },
  {
    route: 'addresstypes',
    label: <FormattedMessage id="ui-users.settings.addressTypes" />,
    component: AddressTypesSettings,
    perm: 'ui-users.settings.addresstypes',
  },
  {
    route: 'departments',
    label: <FormattedMessage id="ui-users.settings.departments" />,
    component: DepartmentsSettings,
    perm: 'ui-users.settings.departments.view'
  },
  {
    route: 'profilepictures',
    label: <FormattedMessage id="ui-users.settings.profilePictures" />,
    component: ProfilePictureSettings,
    perm: 'ui-users.settings.profilePictures'
  },
  {
    route: 'custom-fields',
    label: <FormattedMessage id="ui-users.settings.customFields" />,
    component: CustomFieldsSettingsPane,
    perm: 'ui-users.settings.customfields.view',
  }
];

const settingsFeefines = [
  {
    route: 'owners',
    label: <FormattedMessage id="ui-users.settings.owners" />,
    component: OwnerSettings,
    perm: 'ui-users.settings.owners',
  },
  {
    route: 'feefinestable',
    label: <FormattedMessage id="ui-users.settings.manualCharges" />,
    component: FeeFineSettings,
    perm: 'ui-users.settings.feefines',
  },
  {
    route: 'waivereasons',
    label: <FormattedMessage id="ui-users.settings.waiveReasons" />,
    component: WaiveSettings,
    perm: 'ui-users.settings.waives',
  },
  {
    route: 'payments',
    label: <FormattedMessage id="ui-users.settings.paymentMethods" />,
    component: PaymentSettings,
    perm: 'ui-users.settings.payments',
  },
  {
    route: 'refunds',
    label: <FormattedMessage id="ui-users.settings.refundReasons" />,
    component: RefundReasonsSettings,
    perm: 'ui-users.settings.refunds',
  },
  {
    route: 'comments',
    label: <FormattedMessage id="ui-users.settings.commentRequired" />,
    component: CommentRequiredSettings,
    perm: 'ui-users.settings.comments',
  },
  {
    route: 'transfers',
    label: <FormattedMessage id="ui-users.settings.transferAccounts" />,
    component: TransferAccountsSettings,
    perm: 'ui-users.settings.transfers',
  },
];

const settingsPatronBlocks = [
  {
    route: 'conditions',
    label: <FormattedMessage id="ui-users.settings.conditions" />,
    component: ConditionsSettings,
    perm: 'ui-users.settings.conditions',
  },
  {
    route: 'limits',
    label: <FormattedMessage id="ui-users.settings.limits" />,
    component: LimitsSettings,
    perm: 'ui-users.settings.limits',
  }
];

export default [
  {
    label: <FormattedMessage id="ui-users.settings.general" />,
    pages: sortBy(settingsGeneral, ['label']),
  },
  {
    label: <FormattedMessage id="ui-users.settings.feefine" />,
    pages: sortBy(settingsFeefines, ['label']),
  },
  {
    label: <FormattedMessage id="ui-users.settings.patronBlocks" />,
    pages: sortBy(settingsPatronBlocks, ['label']),
  },
];
