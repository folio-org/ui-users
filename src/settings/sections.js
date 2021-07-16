import React from 'react';
import { FormattedMessage } from 'react-intl';
import { sortBy } from 'lodash';

import PermissionSets from './permissions/PermissionSets';
import PatronGroupsSettings from './PatronGroupsSettings';
import AddressTypesSettings from './AddressTypesSettings';
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
import BlockTemplates from './patronBlocks/BlockTemplates';
import TransferCriteriaSettings from './TransferCriteriaSettings';

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
  //   Profile pictures are currently unsupported in Folio and the existence of this setting has
  //   confused implementers. Commenting out for now as opposed to deleting it so the existing
  //   files and components aren't orphaned.
  //   {
  //     route: 'profilepictures',
  //     label: <FormattedMessage id="ui-users.settings.profilePictures" />,
  //     component: ProfilePictureSettings,
  //     perm: 'ui-users.settings.profilePictures'
  //   },
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
  {
    route: 'transfer-criteria',
    label: <FormattedMessage id="ui-users.settings.transferCriteria" />,
    component: TransferCriteriaSettings,
    perm: 'ui-plugin-bursar-export.bursar-exports.all',
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
  },
  {
    route: 'manual-block-templates',
    label: <FormattedMessage id="ui-users.settings.manualBlockTemplates" />,
    component: BlockTemplates,
    perm: 'ui-users.settings.patron-block-templates',
    interface: 'feesfines',
  },
];

export default [
  {
    label: <FormattedMessage id="ui-users.settings.general" />,
    pages: sortBy(settingsGeneral, ['label']),
  },
  {
    label: <FormattedMessage id="ui-users.settings.feefine" />,
    pages: sortBy(settingsFeefines, ['label']),
    interface: 'feesfines',
  },
  {
    label: <FormattedMessage id="ui-users.settings.patronBlocks" />,
    pages: sortBy(settingsPatronBlocks, ['label']),
    interface: 'circulation',
  },
];
