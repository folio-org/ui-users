import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { hot } from 'react-hot-loader';
import _ from 'lodash';

import { Route, Switch, IfPermission } from '@folio/stripes/core';
import { CommandList, HasCommand } from '@folio/stripes/components';

import pkg from '../package';
import Settings from './settings';
import commands from './commands';

const PermissionSets = React.lazy(() => import('./settings/permissions/PermissionSets'));
const PatronGroupsSettings = React.lazy(() => import('./settings/PatronGroupsSettings'));
const AddressTypesSettings = React.lazy(() => import('./settings/AddressTypesSettings'));
const ProfilePictureSettings = React.lazy(() => import('./settings/ProfilePictureSettings'));
const OwnerSettings = React.lazy(() => import('./settings/OwnerSettings'));
const FeeFineSettings = React.lazy(() => import('./settings/FeeFineSettings'));
const WaiveSettings = React.lazy(() => import('./settings/WaiveSettings'));
const PaymentSettings = React.lazy(() => import('./settings/PaymentSettings'));
const CommentRequiredSettings = React.lazy(() => import('./settings/CommentRequiredSettings'));
const RefundReasonsSettings = React.lazy(() => import('./settings/RefundReasonsSettings'));
const TransferAccountsSettings = React.lazy(() => import('./settings/TransferAccountsSettings'));

const NoteCreatePage = React.lazy(() => import('./views/Notes/NoteCreatePage'));
const NoteEditPage = React.lazy(() => import('./views/Notes/NoteEditPage'));
const NoteViewPage = React.lazy(() => import('./views/Notes/NoteViewPage'));

const UserSearchContainer = React.lazy(() => import('./routes/UserSearchContainer'));
const UserDetailContainer = React.lazy(() => import('./routes/UserDetailContainer'));
const UserDetailFullscreenContainer = React.lazy(() => import('./routes/UserDetailFullscreenContainer'));
const UserEditContainer = React.lazy(() => import('./routes/UserEditContainer'));
const PatronBlockContainer = React.lazy(() => import('./routes/PatronBlockContainer'));
const ChargeFeesFinesContainer = React.lazy(() => import('./routes/ChargeFeesFinesContainer'));
const AccountsListingContainer = React.lazy(() => import('./routes/AccountsListingContainer'));
const LoansListingContainer = React.lazy(() => import('./routes/LoansListingContainer'));
const LoanDetailContainer = React.lazy(() => import('./routes/LoanDetailContainer'));
const AccountDetailsContainer = React.lazy(() => import('./routes/AccountDetailsContainer'));

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
          <React.Suspense fallback={null}>
            <Switch>
              {[].concat(...settingsSections.map(section => section.pages))
                .filter(setting => !setting.perm || stripes.hasPerm(setting.perm))
                .map(setting => <Route path={`${path}/${setting.route}`} key={setting.route} component={setting.component} />)
              }
            </Switch>
          </React.Suspense>
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
          <React.Suspense fallback={null}>
            <Switch>
              <Route
                path={`${base}/:id/loans/view/:loanid`}
                render={(props) => (
                  <IfPermission perm="ui-users.loans.view">
                    <LoanDetailContainer {...props} />
                  </IfPermission>
                )}
              />
              <Route
                path={`${base}/:id/loans/:loanstatus`}
                render={(props) => (
                  <IfPermission perm="ui-users.loans.view">
                    <LoansListingContainer {...props} />
                  </IfPermission>
                )}
              />
              <Route
                path={`${base}/:id/accounts/:accountstatus/charge`}
                exact
                render={(props) => (
                  <IfPermission perm="ui-users.feesfines.actions.all">
                    <ChargeFeesFinesContainer {...props} />
                  </IfPermission>
                )}
              />
              <Route
                path={`${base}/:id/accounts/view/:accountid`}
                render={(props) => (
                  <IfPermission perm="ui-users.feesfines.actions.all">
                    <AccountDetailsContainer {...props} />
                  </IfPermission>
                )}
              />
              <Route
                path={`${base}/:id/accounts/:accountstatus`}
                exact
                render={(props) => (
                  <IfPermission perm="ui-users.feesfines.actions.all">
                    <AccountsListingContainer {...props} />
                  </IfPermission>
                )}
              />
              <Route path={`${base}/:id/charge/:loanid?`} component={ChargeFeesFinesContainer} />
              <Route path={`${base}/:id/patronblocks/edit/:patronblockid`} component={PatronBlockContainer} />
              <Route path={`${base}/:id/patronblocks/create`} component={PatronBlockContainer} />
              <Route path={`${base}/create`} component={UserEditContainer} />
              <Route path={`${base}/:id/edit`} component={UserEditContainer} />
              <Route path={`${base}/view/:id`} component={UserDetailFullscreenContainer} />
              <Route path={`${base}/notes/new`} exact component={NoteCreatePage} />
              <Route path={`${base}/notes/:id`} exact component={NoteViewPage} />
              <Route path={`${base}/notes/:id/edit`} exact component={NoteEditPage} />
              <Route path={base} component={UserSearchContainer}>
                <Route path={`${base}/preview/:id`} component={UserDetailContainer} />
              </Route>
              <Route render={this.noMatch} />
            </Switch>
          </React.Suspense>
        </HasCommand>
      </CommandList>
    );
  }
}

export default hot(module)(UsersRouting);
