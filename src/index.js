import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { hot } from 'react-hot-loader';

import { Route, Switch } from './router';
import Users from './Users';
import Settings from './settings';
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
import { CommandList } from './components/Commander';
import commands from './commands';

class UsersRouting extends React.Component {
  static actionNames = ['stripesHome', 'usersSortByName'];

  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    showSettings: PropTypes.bool,
  }

  constructor(props) {
    super(props);
    this.connectedApp = props.stripes.connect(Users);
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
      match: { path },
      showSettings,
      stripes,
    } = this.props;

    if (showSettings) {
      return (
        <Route path={path} component={Settings}>
          <Switch>
            {stripes.hasPerm('ui-users.settings.addresstypes') && (
              <Route path={`${path}/addresstypes`} exact component={AddressTypesSettings} />
            )}
            {stripes.hasPerm('ui-users.settings.usergroups') && (
              <Route path={`${path}/groups`} exact component={PatronGroupsSettings} />
            )}
            {stripes.hasPerm('ui-users.editpermsets') && (
              <Route path={`${path}/perms`} exact component={PermissionSets} />
            )}
            <Route path={`${path}/profilepictures`} exact component={ProfilePictureSettings} />

            {stripes.hasPerm('ui-users.settings.feefine') && (
              <Route path={`${path}/comments`} exact component={CommentRequiredSettings} />
            )}
            {stripes.hasPerm('ui-users.settings.feefine') && (
              <Route path={`${path}/feefinestable`} exact component={FeeFineSettings} />
            )}
            {stripes.hasPerm('ui-users.settings.feefine') && (
              <Route path={`${path}/owners`} exact component={OwnerSettings} />
            )}
            {stripes.hasPerm('ui-users.settings.feefine') && (
              <Route path={`${path}/payments`} exact component={PaymentSettings} />
            )}
            {stripes.hasPerm('ui-users.settings.feefine') && (
              <Route path={`${path}/refunds`} exact component={RefundReasonsSettings} />
            )}
            {stripes.hasPerm('ui-users.settings.feefine') && (
              <Route path={`${path}/waivereasons`} exact component={WaiveSettings} />
            )}
          </Switch>
        </Route>
      );
    }

    return (
      <CommandList commands={commands}>
        <Switch>
          <Route
            path={path}
            render={() => <this.connectedApp {...this.props} />}
          />
          <Route render={this.noMatch} />
        </Switch>
      </CommandList>
    );
  }
}

export default hot(module)(UsersRouting);
