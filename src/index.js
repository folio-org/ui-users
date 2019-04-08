import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { hot } from 'react-hot-loader';
import _ from 'lodash';

import { Route, Switch } from '@folio/stripes/core';

import Users from './Users';
import Settings from './settings';
import { CommandList } from './components/Commander';
import commands from './commands';
import UsersContextMenu from './UsersContextMenu';
import PermissionSets from './settings/permissions/PermissionSets';
import PatronGroupsSettings from './settings/PatronGroupsSettings';
import AddressTypesSettings from './settings/AddressTypesSettings';
import ProfilePictureSettings from './settings/ProfilePictureSettings';
import OwnerSettings from './settings/OwnerSettings';
import FeeFineSettings from './settings/FeeFineSettings';
import WaiveSettings from './settings/WaiveSettings';
import PaymentSettings from './settings/PaymentSettings';
import CommentRequiredSettings from './settings/CommentRequiredSettings';
import RefundReasonsSettings from './settings/RefundReasonsSettings';
import TransferAccountsSettings from './settings/TransferAccountsSettings';

const settingsGeneral = [
  {
    route: 'perms',
    label: <FormattedMessage id="ui-users.settings.permissionSet" />,
    component: PermissionSets,
    perm: 'ui-users.editpermsets',
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
    route: 'profilepictures',
    label: <FormattedMessage id="ui-users.settings.profilePictures" />,
    component: ProfilePictureSettings,
  },
];

const settingsFeefines = [
  {
    route: 'owners',
    label: <FormattedMessage id="ui-users.settings.owners" />,
    component: OwnerSettings,
    perm: 'ui-users.settings.feefine',
  },
  {
    route: 'feefinestable',
    label: <FormattedMessage id="ui-users.settings.manualCharges" />,
    component: FeeFineSettings,
    perm: 'ui-users.settings.feefine',
  },
  {
    route: 'waivereasons',
    label: <FormattedMessage id="ui-users.settings.waiveReasons" />,
    component: WaiveSettings,
    perm: 'ui-users.settings.feefine',
  },
  {
    route: 'payments',
    label: <FormattedMessage id="ui-users.settings.paymentMethods" />,
    component: PaymentSettings,
    perm: 'ui-users.settings.feefine',
  },
  {
    route: 'refunds',
    label: <FormattedMessage id="ui-users.settings.refundReasons" />,
    component: RefundReasonsSettings,
    perm: 'ui-users.settings.feefine',
  },
  {
    route: 'comments',
    label: <FormattedMessage id="ui-users.settings.commentRequired" />,
    component: CommentRequiredSettings,
    perm: 'ui-users.settings.feefine',
  },
  {
    route: 'transfers',
    label: <FormattedMessage id="ui-users.settings.transferAccounts" />,
    component: TransferAccountsSettings,
    perm: 'ui-users.settings.transfers',
  },
];

export const settingsSections = [
  {
    label: <FormattedMessage id="ui-users.settings.general" />,
    pages: _.sortBy(settingsGeneral, ['label']),
  },
  {
    label: <FormattedMessage id="ui-users.settings.feefine" />,
    pages: _.sortBy(settingsFeefines, ['label']),
  },
];

class UsersRouting extends React.Component {
  static actionNames = ['stripesHome', 'usersSortByName'];

  static propTypes = {
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
    }).isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    showSettings: PropTypes.bool,
  }

  noMatch() {
    const {
      location: { pathname },
    } = this.props;

    return (
      <div>
        <h2>
          <FormattedMessage id="ui-users.errors.noMatch.oops" />
        </h2>
        <p>
          <FormattedMessage
            id="ui-users.errors.noMatch.how"
            values={{ location: <tt>{pathname}</tt> }}
          />
        </p>
      </div>
    );
  }

  render() {
    const {
      showSettings,
      match: { path },
      stripes
    } = this.props;

    if (showSettings) {
      return (
        <Route path={path} component={Settings}>
          <Switch>
            {[].concat(...settingsSections.map(section => section.pages))
              .filter(setting => !setting.perm || stripes.hasPerm(setting.perm))
              .map(setting => <Route path={`${path}/${setting.route}`} key={setting.route} component={setting.component} />)
            }
          </Switch>
        </Route>
      );
    }

    return (
      <CommandList commands={commands}>
        <UsersContextMenu />
        <Switch>
          <Route path={path} component={Users} />
          <Route render={this.noMatch} />
        </Switch>
      </CommandList>
    );
  }
}

export default hot(module)(UsersRouting);
