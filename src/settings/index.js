import _ from 'lodash';
import React, { Component } from 'react';
import {
  FormattedMessage,
  injectIntl,
  intlShape,
} from 'react-intl';

import { Settings } from '@folio/stripes/smart-components';

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

class UsersSettings extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  };

  // eslint-disable-next-line react/sort-comp
  render() {
    return (
      <Settings
        {...this.props}
        sections={this.getSections()}
        paneTitle={<FormattedMessage id="ui-users.settings.label" />}
      />
    );
  }

  getSections() {
    return [
      {
        label: <FormattedMessage id="ui-users.settings.general" />,
        pages: _.sortBy(this.getGeneral(), ['label']),
      },
      {
        label: <FormattedMessage id="ui-users.settings.feefine" />,
        pages: _.sortBy(this.getFeefines(), ['label']),
      },
    ];
  }

  getGeneral() {
    const { formatMessage } = this.props.intl;

    return [
      {
        route: 'perms',
        label: formatMessage({ id: 'ui-users.settings.permissionSet' }),
        component: PermissionSets,
        perm: 'ui-users.editpermsets',
      },
      {
        route: 'groups',
        label: formatMessage({ id: 'ui-users.settings.patronGroups' }),
        component: PatronGroupsSettings,
        perm: 'ui-users.settings.usergroups',
      },
      {
        route: 'addresstypes',
        label: formatMessage({ id: 'ui-users.settings.addressTypes' }),
        component: AddressTypesSettings,
        perm: 'ui-users.settings.addresstypes',
      },
      {
        route: 'profilepictures',
        label: formatMessage({ id: 'ui-users.settings.profilePictures' }),
        component: ProfilePictureSettings,
      },
    ];
  }

  getFeefines() {
    const { formatMessage } = this.props.intl;

    return [
      {
        route: 'owners',
        label: formatMessage({ id: 'ui-users.settings.owners' }),
        component: OwnerSettings,
        perm: 'ui-users.settings.owners',
      },
      {
        route: 'feefinestable',
        label: formatMessage({ id: 'ui-users.settings.manualCharges' }),
        component: FeeFineSettings,
        perm: 'ui-users.settings.feefines',
      },
      {
        route: 'waivereasons',
        label: formatMessage({ id: 'ui-users.settings.waiveReasons' }),
        component: WaiveSettings,
        perm: 'ui-users.settings.waives',
      },
      {
        route: 'payments',
        label: formatMessage({ id: 'ui-users.settings.paymentMethods' }),
        component: PaymentSettings,
        perm: 'ui-users.settings.payments',
      },
      {
        route: 'refunds',
        label: formatMessage({ id: 'ui-users.settings.refundReasons' }),
        component: RefundReasonsSettings,
        perm: 'ui-users.settings.refunds',
      },
      {
        route: 'comments',
        label: formatMessage({ id: 'ui-users.settings.commentRequired' }),
        component: CommentRequiredSettings,
        perm: 'ui-users.settings.comments',
      },
    ];
  }
}

export default injectIntl(UsersSettings);
