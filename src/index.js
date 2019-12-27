import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { hot } from 'react-hot-loader';
import _ from 'lodash';

import { Route, Switch, IfPermission } from '@folio/stripes/core';
import { CommandList, HasCommand } from '@folio/stripes/components';

import * as Routes from './routes';

import pkg from '../package';
import Settings from './settings';
import commands from './commands';
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
import {
  NoteCreatePage,
  NoteViewPage,
  NoteEditPage
} from './views';

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
    history: PropTypes.object,
  }

  componentDidMount() {
    const {
      location,
      history
    } = this.props;

    const query = queryString.parse(location.search);
    const uidRegEx = /\/([^/]*)$/gm;
    if (query.layer === 'loan') {
      if (query.loan) {
        const uid = uidRegEx.exec(location.pathname);
        history.replace(`/users/${uid[1]}/loans/view/${query.loan}`);
      }
    }
    if (query.layer === 'account') {
      if (query.account) {
        const uid = uidRegEx.exec(location.pathname);
        history.replace(`/users/${uid[1]}/accounts/view/${query.account}`);
      }
    }
    if (query.layer === 'charge') {
      const uid = uidRegEx.exec(location.pathname);
      if (query.loan) {
        history.replace(`/users/${uid[1]}/charge/${query.loan}`);
      } else {
        history.replace(`/users/${uid[1]}/charge`);
      }
    }
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

  focusSearchField = () => {
    const { history } = this.props;
    const el = document.getElementById('input-user-search');
    if (el) {
      el.focus();
    } else {
      history.push(pkg.stripes.home);
    }
  }

  shortcuts = [
    {
      name: 'search',
      handler: this.focusSearchField
    },
  ];

  checkScope = () => {
    return document.body.contains(document.activeElement);
  }

  render() {
    const {
      showSettings,
      match: { path },
      stripes
    } = this.props;

    this.shortcutScope = document.body;
    const base = '/users';

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
        <HasCommand
          commands={this.shortcuts}
          isWithinScope={this.checkScope}
          scope={this.shortcutScope}
        >
          <Switch>
            <Route
              path={`${base}/:id/loans/view/:loanid`}
              render={(props) => (
                <IfPermission perm="ui-users.loans.view">
                  <Routes.LoanDetailContainer {...props} />
                </IfPermission>
              )}
            />
            <Route
              path={`${base}/:id/loans/:loanstatus`}
              render={(props) => (
                <IfPermission perm="ui-users.loans.view">
                  <Routes.LoansListingContainer {...props} />
                </IfPermission>
              )}
            />
            <Route
              path={`${base}/:id/accounts/:accountstatus/charge`}
              exact
              render={(props) => (
                <IfPermission perm="ui-users.feesfines.actions.all">
                  <Routes.FeesFinesContainer {...props} />
                </IfPermission>
              )}
            />
            <Route
              path={`${base}/:id/accounts/view/:accountid`}
              render={(props) => (
                <IfPermission perm="ui-users.feesfines.actions.all">
                  <Routes.AccountDetailsContainer {...props} />
                </IfPermission>
              )}
            />
            <Route
              path={`${base}/:id/accounts/:accountstatus`}
              exact
              component={Routes.AccountsListingContainer}
              render={(props) => (
                <IfPermission perm="ui-users.feesfines.actions.all">
                  <Routes.AccountsListingContainer {...props} />
                </IfPermission>
              )}
            />
            <Route path={`${base}/:id/charge/:loanid?`} component={Routes.ChargeFeesFinesContainer} />
            <Route path={`${base}/:id/patronblocks/edit/:patronblockid`} component={Routes.PatronBlockContainer} />
            <Route path={`${base}/:id/patronblocks/create`} component={Routes.PatronBlockContainer} />
            <Route path={`${base}/create`} component={Routes.UserEditContainer} />
            <Route path={`${base}/:id/edit`} component={Routes.UserEditContainer} />
            <Route path={`${base}/view/:id`} component={Routes.UserDetailFullscreenContainer} />
            <Route path={`${base}/notes/new`} exact component={NoteCreatePage} />
            <Route path={`${base}/notes/:id`} exact component={NoteViewPage} />
            <Route path={`${base}/notes/:id/edit`} exact component={NoteEditPage} />
            <Route path={base} component={Routes.UserSearchContainer}>
              <Route path={`${base}/preview/:id`} component={Routes.UserDetailContainer} />
            </Route>
            <Route render={this.noMatch} />
          </Switch>
        </HasCommand>
      </CommandList>
    );
  }
}

export default hot(module)(UsersRouting);
